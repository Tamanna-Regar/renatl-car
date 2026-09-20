from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dashboard_routes import router as dashboard_router

from datetime import datetime
from math import asin, cos, radians, sin, sqrt
from uuid import uuid4
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
import asyncio
from pathlib import Path

import stripe
from bson import ObjectId


app = FastAPI()
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

AUTH_SECRET = os.getenv("AUTH_SECRET")
if not AUTH_SECRET:
    AUTH_SECRET = secrets.token_urlsafe(32)
DEVICE_API_KEY = os.getenv("DEVICE_API_KEY", "").strip()
MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN", "").strip()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 210000)
    return f"pbkdf2_sha256$sha256$210000${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, stored_password: str) -> bool:
    if not stored_password.startswith("pbkdf2_sha256$"):
        return hmac.compare_digest(stored_password, password)
    try:
        parts = stored_password.split("$")
        if len(parts) == 5:
            prefix, algorithm, iterations, encoded_salt, encoded_digest = parts
            if prefix != "pbkdf2_sha256" or algorithm != "sha256":
                return False
        elif len(parts) == 4:
            prefix, iterations, encoded_salt, encoded_digest = parts
            if prefix != "pbkdf2_sha256":
                return False
        else:
            return False
        salt = base64.urlsafe_b64decode(encoded_salt.encode())
        expected = base64.urlsafe_b64decode(encoded_digest.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, role: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": subject, "role": role, "exp": int(time.time()) + 86400}

    def encode(value: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).decode().rstrip("=")

    unsigned = f"{encode(header)}.{encode(payload)}"
    signature = hmac.new(AUTH_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest()
    return f"{unsigned}.{base64.urlsafe_b64encode(signature).decode().rstrip('=')}"


def verify_access_token(authorization: str | None) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.split(" ", 1)[1].strip()
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Invalid access token.")
    unsigned, encoded_signature = ".".join(parts[:2]), parts[2]
    expected_signature = hmac.new(AUTH_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest()
    try:
        supplied_signature = base64.urlsafe_b64decode((encoded_signature + "=" * (-len(encoded_signature) % 4)).encode())
        payload = json.loads(base64.urlsafe_b64decode((parts[1] + "=" * (-len(parts[1]) % 4)).encode()))
    except (ValueError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Invalid access token.")
    if not hmac.compare_digest(supplied_signature, expected_signature) or int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=401, detail="Expired or invalid access token.")
    if payload.get("role") not in {"admin", "user"} or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid access token claims.")
    return payload


def require_admin(authorization: str | None = Header(default=None)) -> dict:
    identity = verify_access_token(authorization)
    if identity["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return identity


@app.get("/api/auth/me")
async def get_current_user(authorization: str | None = Header(default=None)):
    return {"success": True, "identity": verify_access_token(authorization)}


class LiveFleetConnections:
    def __init__(self):
        self.connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, payload: dict):
        disconnected = []
        for connection in self.connections:
            try:
                await connection.send_json(payload)
            except Exception:
                disconnected.append(connection)
        for connection in disconnected:
            self.disconnect(connection)


live_fleet_connections = LiveFleetConnections()


def haversine_distance(latitude_one: float, longitude_one: float, latitude_two: float, longitude_two: float) -> float:
    earth_radius_km = 6371.0
    delta_latitude = radians(latitude_two - latitude_one)
    delta_longitude = radians(longitude_two - longitude_one)
    haversine = (
        sin(delta_latitude / 2) ** 2
        + cos(radians(latitude_one))
        * cos(radians(latitude_two))
        * sin(delta_longitude / 2) ** 2
    )
    return earth_radius_km * 2 * asin(sqrt(haversine))


async def fetch_mapbox_route(
    latitude: float,
    longitude: float,
    destination_latitude: float,
    destination_longitude: float,
):
    if not MAPBOX_ACCESS_TOKEN:
        return None
    coordinates = f"{longitude},{latitude};{destination_longitude},{destination_latitude}"
    query = urllib.parse.urlencode({
        "access_token": MAPBOX_ACCESS_TOKEN,
        "overview": "false",
        "annotations": "duration",
    })
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving-traffic/{coordinates}?{query}"

    def request_route():
        request = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(request, timeout=5) as response:
            return json.loads(response.read().decode())

    try:
        data = await asyncio.to_thread(request_route)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None
    routes = data.get("routes") or []
    if not routes:
        return None
    route = routes[0]
    return {
        "distance_km": round(float(route.get("distance", 0)) / 1000, 1),
        "duration_minutes": round(float(route.get("duration", 0)) / 60),
        "traffic_label": "Live traffic",
        "traffic_source": "Mapbox driving-traffic",
    }

# STRIPE
# Yahan Stripe TEST SECRET KEY 
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# MONGODB
client = AsyncIOMotorClient(
    "mongodb://localhost:27017"
)

db = client["rental_car_db"]

admins_collection = db["admins"]
users_collection = db["users"]
vehicles_collection = db["vehicles"]
bookings_collection = db["bookings"]
inspection_collection = db["booking_inspections"]
reviews_collection = db["reviews"]
promos_collection = db["promos"]
marketplace_collection = db["marketplace_listings"]
telemetry_collection = db["vehicle_telemetry"]
telemetry_history_collection = db["vehicle_telemetry_history"]
incidents_collection = db["fleet_incidents"]
maintenance_collection = db["maintenance_work_orders"]
trip_events_collection = db["trip_events"]


class LiveTelemetryModel(BaseModel):
    vehicle_id: str
    powertrain: str = "petrol"
    latitude: float | None = None
    longitude: float | None = None
    destination_latitude: float | None = None
    destination_longitude: float | None = None
    speed_kmh: float = 0
    fuel_level: float | None = None
    battery_level: float | None = None
    ignition: bool = False
    geofence_status: str = "unknown"
    recorded_at: str | None = None
    traffic_factor: float = 1.0

# MODELS
class AdminLogin(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserModel(BaseModel):
    name: str
    email: str
    phone: str
    licenseNo: str
    password: str


class VehicleModel(BaseModel):
    name: str
    brand: str
    price_per_day: float
    car_number: str = "N/A"
    type: str = "car"
    status: str = "available"
    model: str | None = None
    year: int | None = None
    fuel_type: str | None = None
    transmission: str | None = None
    seating_capacity: int | None = None
    engine_cc: int | None = None
    mileage_kmpl: float | None = None
    helmet_included: bool = False
    helmet_count: int = 0
    battery_range_km: float | None = None


class MaintenanceWorkOrderModel(BaseModel):
    vehicle_id: str
    vehicle_name: str
    vehicle_type: str = "car"
    issue: str
    mechanic: str = ""
    scheduled_date: str
    parts_cost: float = 0
    labour_cost: float = 0
    notes: str = ""


ALLOWED_UPLOAD_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}


@app.post("/api/uploads")
async def upload_document(file: UploadFile = File(...)):
    extension = ALLOWED_UPLOAD_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, and PDF files are supported.")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size must be 10 MB or less.")
    safe_name = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / safe_name
    destination.write_bytes(content)
    return {
        "success": True,
        "url": f"/uploads/{safe_name}",
        "filename": file.filename or safe_name,
        "content_type": file.content_type,
        "size": len(content),
    }


class MarketplaceListingRequest(BaseModel):
    owner_name: str
    owner_email: str
    vehicle_name: str
    vehicle_type: str = "car"
    city: str
    price_per_day: float
    seats: int = 4
    image: str | None = None
    features: list[str] = []


class MarketplaceStatusRequest(BaseModel):
    status: str


class BookingModel(BaseModel):
    user_email: str = "guest@gmail.com"
    vehicle_id: str
    vehicle_name: str
    vehicle_type: str
    start_date: str
    end_date: str
    total_days: int
    total_price: float
    pickup_latitude: float | None = None
    pickup_longitude: float | None = None
    geofence_status: str | None = None
    geofence_message: str | None = None
    pickup_branch: str | None = None
    dropoff_branch: str | None = None
    pickup_time: str | None = None
    return_time: str | None = None
    one_way: bool = False
    late_fee: float = 0

# PAYMENT MODEL

class PaymentIntentModel(BaseModel):
    booking_id: str
    amount: float
    currency: str = "inr"
    email: str = ""
    security_deposit: float = 0


class PaymentUpdateModel(BaseModel):
    payment_status: str
    booking_status: str
    payment_id: str
    paid_at: str


class BookingStatusUpdateModel(BaseModel):
    status: str
    payment_status: str | None = None
    booking_status: str | None = None


class ReviewModel(BaseModel):
    vehicle_name: str
    user_name: str
    rating: int
    comment: str

class PromoModel(BaseModel):
    code: str


class DynamicPricingRequest(BaseModel):
    vehicle_id: str
    vehicle_type: str = "car"
    start_date: str
    end_date: str
    base_price: float
    promo_code: str | None = None


class PredictivePricingRequest(BaseModel):
    vehicle_id: str
    vehicle_type: str = "car"
    start_date: str
    end_date: str
    base_price: float
    city: str = "Delhi"


class CorporateBookingRequest(BaseModel):
    company_name: str
    company_email: str
    contact_person: str
    gst_number: str | None = None
    vehicle_id: str
    vehicle_name: str
    vehicle_type: str = "car"
    start_date: str
    end_date: str
    passengers: int = 4
    billing_cycle: str = "monthly"
    invoice_required: bool = True
    notes: str | None = None


class FraudRiskRequest(BaseModel):
    email: str
    phone: str | None = None
    city: str | None = None
    vehicle_id: str | None = None
    booking_amount: float | None = None
    booking_days: int | None = None
    duplicate_attempts: int = 0
    verification_status: str = "pending"


class GeofenceCheckRequest(BaseModel):
    city: str
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    vehicle_id: str | None = None


class CancellationPolicyModel(BaseModel):
    reason: str = "Customer requested cancellation"
    policy: str = "standard"


class DamageReportModel(BaseModel):
    booking_id: str
    vehicle_name: str
    user_email: str
    report_type: str = "post_ride"
    description: str
    damage_spots: list = []
    photo_url: str | None = None


class BookingInspectionModel(BaseModel):
    booking_id: str
    user_email: str
    inspection_type: str = "check_in"
    odometer: float
    fuel_level: int
    condition_notes: str = ""
    photo_urls: list[str] = []
    confirmed: bool = False
    helmet_count_issued: int = 0
    helmet_count_returned: int = 0
    helmet_condition: str = "good"
    brakes_checked: bool = False
    lights_checked: bool = False
    tyres_checked: bool = False
    safety_confirmed: bool = False


class SOSRequest(BaseModel):
    user_email: str = ""
    message: str = "Customer requested emergency assistance."
    latitude: float | None = None
    longitude: float | None = None
    emergency_type: str = "general"


class NotificationModel(BaseModel):
    booking_id: str | None = None
    user_email: str | None = None
    type: str
    title: str
    message: str
    channel: str = "email"


class RecommendationRequest(BaseModel):
    trip_type: str = "family"
    passengers: int = 4
    duration_days: int = 3
    city: str = "Delhi"
    budget_per_day: float | None = None


class DocVerifyModel(BaseModel):
    docStatus: str | None = None
    status: str | None = None


class UserVerificationModel(BaseModel):
    documentUrl: str | None = None
    verificationStatus: str | None = None


BOOKING_STATUS_MAP = {
    "pending": "Pending",
    "pending payment": "Pending Payment",
    "pending-payment": "Pending Payment",
    "confirmed": "Confirmed",
    "payment received": "Payment Received",
    "payment-received": "Payment Received",
    "active": "Active",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "cancelled by user": "Cancelled",
    "overdue": "Overdue",
    "rejected": "Rejected"
}


ACTIVE_BOOKING_STATUSES = {
    "pending",
    "pending payment",
    "confirmed",
    "payment received",
    "active",
    "overdue"
}

INSPECTION_TYPES = {"check_in", "check_out"}


BOOKING_STATUS_FLOW = {
    "Pending": {"Pending Payment", "Confirmed", "Cancelled"},
    "Pending Payment": {"Payment Received", "Cancelled"},
    "Payment Received": {"Confirmed", "Active", "Cancelled"},
    "Confirmed": {"Active", "Cancelled", "Overdue"},
    "Active": {"Completed", "Overdue", "Cancelled"},
    "Overdue": {"Completed", "Cancelled"},
    "Completed": set(),
    "Cancelled": set(),
    "Rejected": set()
}


def normalize_booking_status(value):
    if value is None:
        return "Pending"

    key = str(value).strip().lower()
    return BOOKING_STATUS_MAP.get(key, str(value).strip())


def parse_booking_date(date_value: str):
    try:
        return datetime.strptime(date_value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format: {date_value}. Use YYYY-MM-DD."
        ) from exc


def get_day_pricing_breakdown(base_price: float, start_date: str, end_date: str):
    start = parse_booking_date(start_date)
    end = parse_booking_date(end_date)
    total_days = (end - start).days + 1
    if total_days <= 0:
        raise HTTPException(status_code=400, detail="Booking duration must be at least 1 day.")

    weekend_surcharge = 0.0
    peak_surcharge = 0.0
    seasonal_multiplier = 1.0

    for offset in range(total_days):
        day = start.fromordinal(start.toordinal() + offset)
        weekday = day.weekday()
        month = day.month

        if weekday >= 5:
            weekend_surcharge += base_price * 0.10

        if month in {10, 11, 12, 1, 2}:
            peak_surcharge += base_price * 0.15

    base_subtotal = base_price * total_days
    subtotal = base_subtotal + weekend_surcharge + peak_surcharge

    return {
        "days": total_days,
        "base_subtotal": round(base_subtotal, 2),
        "weekend_surcharge": round(weekend_surcharge, 2),
        "peak_surcharge": round(peak_surcharge, 2),
        "seasonal_multiplier": round(seasonal_multiplier, 2),
        "subtotal": round(subtotal, 2),
    }


def calculate_predictive_price(base_price: float, start_date: str, end_date: str, city: str = "Delhi", vehicle_type: str = "car"):
    if base_price <= 0:
        raise HTTPException(status_code=400, detail="Base price must be greater than zero.")

    breakdown = get_day_pricing_breakdown(base_price, start_date, end_date)

    start = parse_booking_date(start_date)
    end = parse_booking_date(end_date)
    total_days = (end - start).days + 1
    weekend_days = 0
    peak_days = 0

    current_day = start
    for _ in range(total_days):
        if current_day.weekday() >= 5:
            weekend_days += 1
        if current_day.month in {10, 11, 12, 1, 2}:
            peak_days += 1
        current_day = current_day.fromordinal(current_day.toordinal() + 1)

    city_name = (city or "Delhi").strip().lower()
    city_multiplier = {
        "delhi": 1.18,
        "mumbai": 1.22,
        "bangalore": 1.2,
        "hyderabad": 1.14,
        "pune": 1.1,
        "chennai": 1.12,
        "jaipur": 1.08,
        "goa": 1.16,
    }.get(city_name, 1.05)

    vehicle_multiplier = 1.0 if str(vehicle_type).lower() == "car" else 1.08
    weekend_multiplier = 1.0 + (weekend_days / max(1, total_days)) * 0.12
    season_multiplier = 1.0 + (peak_days / max(1, total_days)) * 0.18
    demand_multiplier = city_multiplier * vehicle_multiplier * weekend_multiplier * season_multiplier

    recommended_rate_per_day = round(base_price * demand_multiplier, 2)
    recommended_total = round(breakdown["subtotal"] * demand_multiplier, 2)
    adjustment_percent = round(((demand_multiplier - 1) * 100), 2)

    if adjustment_percent > 18:
        forecast_label = "High demand"
    elif adjustment_percent > 8:
        forecast_label = "Moderate demand"
    else:
        forecast_label = "Low demand"

    return {
        "days": total_days,
        "base_subtotal": breakdown["base_subtotal"],
        "recommended_rate_per_day": recommended_rate_per_day,
        "recommended_total": recommended_total,
        "adjustment_percent": adjustment_percent,
        "demand_multiplier": round(demand_multiplier, 3),
        "forecast_label": forecast_label,
        "city": city_name,
        "vehicle_type": str(vehicle_type).lower(),
    }


def dates_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    start_a_date = parse_booking_date(start_a)
    end_a_date = parse_booking_date(end_a)
    start_b_date = parse_booking_date(start_b)
    end_b_date = parse_booking_date(end_b)

    return start_a_date <= end_b_date and end_a_date >= start_b_date


async def get_vehicle_booking_conflicts(vehicle_id: str, start_date: str, end_date: str):
    vehicle_id_str = str(vehicle_id)
    conflicting_bookings = []

    bookings = await bookings_collection.find({
        "vehicle_id": vehicle_id_str
    }).to_list(length=200)

    for booking in bookings:
        status = str(booking.get("status", "")).strip().lower()
        if status not in ACTIVE_BOOKING_STATUSES:
            continue

        existing_start = booking.get("start_date")
        existing_end = booking.get("end_date")
        if not existing_start or not existing_end:
            continue

        if dates_overlap(start_date, end_date, existing_start, existing_end):
            conflicting_bookings.append({
                "booking_id": str(booking.get("_id")),
                "status": booking.get("status"),
                "start_date": existing_start,
                "end_date": existing_end
            })

    return conflicting_bookings


# ADMIN LOGIN

@app.post("/api/admin/login")
async def admin_login(data: AdminLogin):

    username = data.username.strip()

    admin = await admins_collection.find_one({
        "username": username
    })

    if admin and verify_password(data.password, str(admin.get("password", ""))):
        if not str(admin.get("password", "")).startswith("pbkdf2_sha256$"):
            await admins_collection.update_one(
                {"_id": admin["_id"]},
                {"$set": {"password": hash_password(data.password)}},
            )

        return {
            "success": True,
            "message": "Login successful",
            "role": "admin",
            "token": create_access_token(username, "admin"),
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid username or password"
    )


# USER LOGIN

@app.post("/api/login")
async def user_login(data: UserLogin):

    # Email clean

    email = data.email.strip().lower()
    password = data.password

    # FIRST: Exact lowercase email search

    user = await users_collection.find_one({
        "email": email
    })

    # SECOND: Case-insensitive search

    if user is None:

        user = await users_collection.find_one({
            "email": {
                "$regex": f"^{email}$",
                "$options": "i"
            }
        })

    # User mila ya nahi

    if user is None:

        print("USER NOT FOUND:", email)

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # Password check

    stored_password = str(
        user.get("password", "")
    )

    if not verify_password(password, stored_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not stored_password.startswith("pbkdf2_sha256$"):
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hash_password(password)}},
        )


    verification_status = user.get("verificationStatus") or user.get("docStatus") or "Unverified"

    return {
        "success": True,
        "message": "Login successful",
        "role": "user",
        "token": create_access_token(email, "user"),
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "licenseNo": user.get("licenseNo", ""),
            "verificationStatus": verification_status,
            "docStatus": verification_status,
            "documentUrl": user.get("documentUrl", "")
        }
    }

# USER REGISTER

@app.post("/api/register")
async def register_user(user: UserModel):

    # Clean user data

    name = user.name.strip()
    email = user.email.strip().lower()
    phone = user.phone.strip()
    license_no = user.licenseNo.strip()
    password = user.password

    # Check existing email

    existing_user = await users_collection.find_one({
        "email": {
            "$regex": f"^{email}$",
            "$options": "i"
        }
    })


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create user data

    user_data = {
        "name": name,
        "username": name,
        "email": email,
        "phone": phone,
        "licenseNo": license_no,
        "password": hash_password(password),
        "role": "user",
        "docStatus": "Pending Review",
        "verificationStatus": "Pending Review",
        "documentUrl": ""
    }

    # Save in MongoDB

    result = await users_collection.insert_one(
        user_data
    )


    print("")
    print("NEW USER REGISTERED")
    print("Name:", name)
    print("Email:", email)
    print("MongoDB ID:", result.inserted_id)
    print("")


    return {
        "success": True,
        "message": "User registered successfully!",
        "user_id": str(result.inserted_id)
    }

# ADD VEHICLE

@app.post("/api/admin/vehicles")
async def add_vehicle(vehicle: VehicleModel):

    vehicle_data = vehicle.model_dump()

    result = await vehicles_collection.insert_one(
        vehicle_data
    )

    return {
        "success": True,
        "message": "Vehicle added successfully!",
        "id": str(result.inserted_id)
    }

# GET VEHICLES

@app.get("/api/admin/vehicles")
async def get_vehicles():

    vehicles = await vehicles_collection.find(
        {},
        {"_id": 0}
    ).to_list(length=100)

    return {
        "success": True,
        "cars": vehicles
    }


@app.post("/api/admin/maintenance")
async def create_maintenance_work_order(work_order: MaintenanceWorkOrderModel):
    if not work_order.issue.strip():
        raise HTTPException(status_code=400, detail="Maintenance issue is required.")
    if work_order.parts_cost < 0 or work_order.labour_cost < 0:
        raise HTTPException(status_code=400, detail="Maintenance costs cannot be negative.")
    data = work_order.model_dump()
    data.update({
        "work_order_id": str(uuid4()),
        "status": "open",
        "total_cost": round(work_order.parts_cost + work_order.labour_cost, 2),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    })
    await maintenance_collection.insert_one(data)
    await vehicles_collection.update_one(
        {"name": work_order.vehicle_name},
        {"$set": {"status": "maintenance", "isBooked": False}},
    )
    return {"success": True, "work_order": data}


@app.get("/api/admin/maintenance")
async def get_maintenance_work_orders(status: str | None = None):
    query = {"status": status} if status else {}
    orders = await maintenance_collection.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=200)
    return {"success": True, "work_orders": orders}


@app.patch("/api/admin/maintenance/{work_order_id}")
async def update_maintenance_work_order(work_order_id: str, status: str):
    if status not in {"open", "in_progress", "completed", "cancelled"}:
        raise HTTPException(status_code=400, detail="Invalid maintenance status.")
    order = await maintenance_collection.find_one({"work_order_id": work_order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found.")
    await maintenance_collection.update_one(
        {"work_order_id": work_order_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}},
    )
    if status == "completed":
        await vehicles_collection.update_one(
            {"$or": [{"name": order.get("vehicle_name")}, {"id": order.get("vehicle_id")}]},
            {"$set": {"status": "available", "isBooked": False}},
        )
    return {"success": True, "status": status}


@app.get("/api/marketplace/listings")
async def get_marketplace_listings(city: str | None = None, vehicle_type: str | None = None):
    query = {"status": "approved"}
    if city and city.strip():
        query["city"] = {"$regex": f"^{city.strip()}$", "$options": "i"}
    if vehicle_type and vehicle_type.strip():
        query["vehicle_type"] = vehicle_type.strip().lower()

    listings = await marketplace_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=50)
    return {"success": True, "listings": listings}


@app.post("/api/marketplace/listings")
async def create_marketplace_listing(payload: MarketplaceListingRequest):
    owner_name = payload.owner_name.strip()
    owner_email = payload.owner_email.strip().lower()
    vehicle_name = payload.vehicle_name.strip()
    city = payload.city.strip()

    if not owner_name or not owner_email or not vehicle_name or not city:
        raise HTTPException(status_code=400, detail="Owner, vehicle, and city details are required.")
    if payload.price_per_day <= 0:
        raise HTTPException(status_code=400, detail="Daily price must be greater than zero.")
    if payload.seats < 1 or payload.seats > 50:
        raise HTTPException(status_code=400, detail="Seats must be between 1 and 50.")

    listing = {
        "owner_name": owner_name,
        "owner_email": owner_email,
        "vehicle_name": vehicle_name,
        "vehicle_type": payload.vehicle_type.strip().lower(),
        "city": city,
        "price_per_day": round(payload.price_per_day, 2),
        "seats": payload.seats,
        "image": payload.image,
        "features": [feature.strip() for feature in payload.features if feature.strip()][:8],
        "status": "pending_review",
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await marketplace_collection.insert_one(listing)
    return {
        "success": True,
        "message": "Listing submitted for admin approval.",
        "listing_id": str(result.inserted_id),
        "status": listing["status"],
    }


@app.get("/api/admin/marketplace/listings")
async def get_admin_marketplace_listings():
    listings = await marketplace_collection.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=200)
    return {"success": True, "listings": listings}


@app.patch("/api/admin/marketplace/listings/{listing_id}/status")
async def update_marketplace_listing_status(listing_id: str, payload: MarketplaceStatusRequest):
    status = payload.status.strip().lower()
    if status not in {"approved", "rejected", "pending_review"}:
        raise HTTPException(status_code=400, detail="Unsupported marketplace listing status.")

    try:
        listing_object_id = ObjectId(listing_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid marketplace listing ID.") from exc

    result = await marketplace_collection.update_one(
        {"_id": listing_object_id},
        {"$set": {"status": status, "reviewed_at": datetime.utcnow().isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Marketplace listing not found.")
    return {"success": True, "status": status}


def get_vehicle_health(vehicle: dict):
    odometer = float(vehicle.get("odometer") or vehicle.get("mileage") or 0)
    last_service_km = float(vehicle.get("lastServiceKm") or max(0, odometer - 2000))
    service_interval_km = float(vehicle.get("serviceIntervalKm") or vehicle.get("service_interval_km") or 5000)
    next_service_date = str(vehicle.get("nextServiceDate") or "").strip()

    usage_ratio = 0.0
    if service_interval_km > 0:
        usage_ratio = max(0.0, min(1.2, (odometer - last_service_km) / service_interval_km))

    days_remaining = 999
    if next_service_date:
        try:
            target_date = datetime.strptime(next_service_date, "%Y-%m-%d").date()
            today = datetime.utcnow().date()
            days_remaining = (target_date - today).days
        except ValueError:
            days_remaining = 999

    status = "healthy"
    risk_label = "Good"
    if str(vehicle.get("status") or "").lower() == "maintenance" or usage_ratio >= 0.85 or days_remaining <= 7:
        status = "critical"
        risk_label = "Service due"
    elif usage_ratio >= 0.6 or days_remaining <= 20:
        status = "warning"
        risk_label = "Monitor"

    health_score = 100
    issues = []
    if usage_ratio >= 0.85:
        health_score -= 35
        issues.append("Service interval nearly reached")
    elif usage_ratio >= 0.6:
        health_score -= 18
        issues.append("Service interval needs monitoring")
    if days_remaining <= 7:
        health_score -= 35
        issues.append("Service date is due soon")
    elif days_remaining <= 20:
        health_score -= 18
        issues.append("Upcoming service date")
    if str(vehicle.get("status") or "").lower() == "maintenance":
        health_score -= 25
        issues.append("Vehicle currently in maintenance")

    return {
        "name": vehicle.get("name", "Vehicle"),
        "type": vehicle.get("type") or "car",
        "odometer": round(odometer, 2),
        "lastServiceKm": round(last_service_km, 2),
        "serviceIntervalKm": round(service_interval_km, 2),
        "nextServiceDate": next_service_date,
        "daysRemaining": days_remaining,
        "usageRatio": round(usage_ratio, 3),
        "status": status,
        "risk_label": risk_label,
        "health_score": max(0, min(100, health_score)),
        "issues": issues or ["No immediate maintenance risks detected"],
        "recommended_action": "Remove from rental inventory until serviced" if status == "critical" else "Schedule preventive maintenance" if status == "warning" else "Keep in active rental rotation",
    }


@app.get("/api/fleet-health")
async def get_fleet_health():
    vehicles = await vehicles_collection.find({}, {"_id": 0}).to_list(length=200)

    fleet_data = [get_vehicle_health(vehicle) for vehicle in vehicles]
    if not fleet_data:
        return {
            "success": True,
            "summary": {"healthy": 0, "warning": 0, "critical": 0, "total": 0},
            "vehicles": []
        }

    summary = {
        "healthy": sum(1 for v in fleet_data if v["status"] == "healthy"),
        "warning": sum(1 for v in fleet_data if v["status"] == "warning"),
        "critical": sum(1 for v in fleet_data if v["status"] == "critical"),
        "total": len(fleet_data),
    }

    return {
        "success": True,
        "summary": summary,
        "vehicles": fleet_data,
    }


@app.get("/api/fleet-health/alerts")
async def get_fleet_health_alerts():
    vehicles = await vehicles_collection.find({}, {"_id": 0}).to_list(length=200)
    alerts = []
    for vehicle in vehicles:
        health = get_vehicle_health(vehicle)
        if health["status"] == "healthy":
            continue
        alerts.append({
            "vehicle": health["name"],
            "severity": health["status"],
            "health_score": health["health_score"],
            "issues": health["issues"],
            "recommended_action": health["recommended_action"],
            "next_service_date": health["nextServiceDate"],
            "days_remaining": health["daysRemaining"],
        })

    alerts.sort(key=lambda alert: (0 if alert["severity"] == "critical" else 1, alert["health_score"]))
    return {"success": True, "total": len(alerts), "alerts": alerts}


@app.post("/api/fleet-live/telemetry")
async def receive_live_telemetry(
    telemetry: LiveTelemetryModel,
    x_device_key: str | None = Header(default=None),
):
    if DEVICE_API_KEY and not hmac.compare_digest(x_device_key or "", DEVICE_API_KEY):
        raise HTTPException(status_code=401, detail="Invalid device API key")
    recorded_at = telemetry.recorded_at or datetime.utcnow().isoformat()
    payload = telemetry.model_dump()
    payload["recorded_at"] = recorded_at
    payload["updated_at"] = datetime.utcnow().isoformat()
    safety_events = []
    if telemetry.speed_kmh > 100:
        safety_events.append({"type": "overspeed", "severity": "critical", "message": "Speed exceeded 100 km/h"})
    if telemetry.fuel_level is not None and telemetry.fuel_level <= 15:
        safety_events.append({"type": "low_fuel", "severity": "warning", "message": "Fuel level is 15% or below"})
    if telemetry.battery_level is not None and telemetry.battery_level <= 15:
        safety_events.append({"type": "low_battery", "severity": "warning", "message": "Battery level is 15% or below"})
    if telemetry.geofence_status == "outside":
        safety_events.append({"type": "geofence_breach", "severity": "critical", "message": "Vehicle left the approved geofence"})
    eco_score = 100
    if telemetry.speed_kmh > 80:
        eco_score -= min(35, int((telemetry.speed_kmh - 80) * 0.7))
    if telemetry.speed_kmh > 100:
        eco_score -= 15
    if telemetry.geofence_status == "outside":
        eco_score -= 10
    payload["eco_score"] = max(0, min(100, eco_score))
    payload["eco_label"] = "Excellent" if eco_score >= 85 else "Efficient" if eco_score >= 65 else "Needs improvement"
    base_carbon_intensity = {
        "electric": 0,
        "hybrid": 90,
        "diesel": 170,
        "petrol": 192,
    }.get(telemetry.powertrain.lower(), 192)
    speed_penalty = max(0, telemetry.speed_kmh - 70) * 0.35
    payload["carbon_intensity_g_per_km"] = round(base_carbon_intensity + speed_penalty, 1)
    payload["carbon_label"] = (
        "Zero tailpipe" if telemetry.powertrain.lower() == "electric"
        else "Low carbon" if base_carbon_intensity <= 100
        else "Standard"
    )
    powertrain = telemetry.powertrain.lower()
    if powertrain == "electric":
        estimated_range_km = (telemetry.battery_level or 0) * 3.5
    elif powertrain == "hybrid":
        estimated_range_km = (telemetry.fuel_level or 0) * 5.5 + (telemetry.battery_level or 0) * 1.5
    else:
        estimated_range_km = (telemetry.fuel_level or 0) * 6
    payload["estimated_range_km"] = round(max(0, estimated_range_km), 1)
    payload["energy_status"] = (
        "Critical" if estimated_range_km < 30
        else "Refuel/charge soon" if estimated_range_km < 100
        else "Ready for trip"
    )
    if (
        telemetry.latitude is not None
        and telemetry.longitude is not None
        and telemetry.destination_latitude is not None
        and telemetry.destination_longitude is not None
    ):
        remaining_distance = haversine_distance(
            telemetry.latitude,
            telemetry.longitude,
            telemetry.destination_latitude,
            telemetry.destination_longitude,
        )
        payload["remaining_distance_km"] = round(remaining_distance, 1)
        traffic_factor = max(0.5, min(3.0, telemetry.traffic_factor))
        payload["traffic_factor"] = traffic_factor
        payload["traffic_label"] = (
            "Heavy traffic" if traffic_factor >= 1.5
            else "Moderate traffic" if traffic_factor >= 1.15
            else "Clear traffic"
        )
        payload["eta_minutes"] = round((remaining_distance / max(telemetry.speed_kmh, 25)) * 60 * traffic_factor)
        payload["trip_status"] = "Arriving soon" if remaining_distance <= 3 else "En route"
    else:
        payload["remaining_distance_km"] = None
        payload["eta_minutes"] = None
        payload["traffic_factor"] = None
        payload["traffic_label"] = "Traffic unavailable"

    if (
        MAPBOX_ACCESS_TOKEN
        and telemetry.latitude is not None
        and telemetry.longitude is not None
        and telemetry.destination_latitude is not None
        and telemetry.destination_longitude is not None
    ):
        live_route = await fetch_mapbox_route(
            telemetry.latitude,
            telemetry.longitude,
            telemetry.destination_latitude,
            telemetry.destination_longitude,
        )
        if live_route:
            payload["remaining_distance_km"] = live_route["distance_km"]
            payload["eta_minutes"] = live_route["duration_minutes"]
            payload["traffic_label"] = live_route["traffic_label"]
            payload["traffic_source"] = live_route["traffic_source"]
        payload["trip_status"] = "Destination unavailable"
    payload["safety_events"] = safety_events
    await telemetry_history_collection.insert_one({**payload})
    await telemetry_collection.update_one(
        {"vehicle_id": telemetry.vehicle_id},
        {"$set": payload},
        upsert=True,
    )
    for event in safety_events:
        if event["severity"] != "critical":
            continue
        existing = await incidents_collection.find_one({
            "vehicle_id": telemetry.vehicle_id,
            "type": event["type"],
            "status": {"$in": ["open", "acknowledged"]},
        })
        if existing:
            continue
        incident = {
            "incident_id": str(uuid4()),
            "vehicle_id": telemetry.vehicle_id,
            "type": event["type"],
            "severity": event["severity"],
            "message": event["message"],
            "status": "open",
            "created_at": recorded_at,
            "updated_at": recorded_at,
        }
        await incidents_collection.insert_one(incident)
        await live_fleet_connections.broadcast({"type": "incident_created", "data": incident})
    await live_fleet_connections.broadcast({"type": "telemetry", "data": payload})
    for event in safety_events:
        await live_fleet_connections.broadcast({
            "type": "safety_event",
            "data": {"vehicle_id": telemetry.vehicle_id, **event, "recorded_at": recorded_at},
        })
    return {"success": True, "telemetry": payload}


@app.get("/api/fleet-live/route")
async def get_live_route(
    latitude: float,
    longitude: float,
    destination_latitude: float,
    destination_longitude: float,
):
    route = await fetch_mapbox_route(
        latitude,
        longitude,
        destination_latitude,
        destination_longitude,
    )
    if route:
        return {"success": True, **route}
    return {
        "success": False,
        "traffic_source": "unavailable",
        "message": "Configure MAPBOX_ACCESS_TOKEN for live traffic routing.",
    }


@app.get("/api/fleet-live/history")
async def get_live_fleet_history(vehicle_id: str | None = None, limit: int = 30):
    safe_limit = max(1, min(limit, 200))
    query = {"vehicle_id": vehicle_id} if vehicle_id else {}
    history = await telemetry_history_collection.find(
        query,
        {"_id": 0},
    ).sort("recorded_at", -1).to_list(length=safe_limit)
    return {"success": True, "history": history}


@app.get("/api/fleet-live/incidents")
async def get_live_incidents():
    incidents = await incidents_collection.find(
        {"status": {"$in": ["open", "acknowledged"]}},
        {"_id": 0},
    ).sort("created_at", -1).to_list(length=100)
    return {"success": True, "incidents": incidents}


@app.patch("/api/fleet-live/incidents/{incident_id}")
async def update_live_incident(incident_id: str, status: str):
    if status not in {"acknowledged", "resolved"}:
        raise HTTPException(status_code=400, detail="Invalid incident status")
    result = await incidents_collection.update_one(
        {"incident_id": incident_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
    payload = {"incident_id": incident_id, "status": status}
    await live_fleet_connections.broadcast({"type": "incident_updated", "data": payload})
    return {"success": True, **payload}


@app.get("/api/fleet-live/snapshot")
async def get_live_fleet_snapshot():
    telemetry = await telemetry_collection.find({}, {"_id": 0}).to_list(length=500)
    return {"success": True, "vehicles": telemetry}


@app.get("/api/bookings/{booking_id}/live-trip")
async def get_booking_live_trip(booking_id: str):
    try:
        booking = await bookings_collection.find_one({"_id": ObjectId(booking_id)}, {"_id": 0})
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid booking ID") from exc
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    vehicle_id = str(booking.get("vehicle_id") or booking.get("vehicleId") or "")
    vehicle_name = str(booking.get("vehicle_name") or booking.get("vehicleName") or "")
    query = {"vehicle_id": vehicle_id} if vehicle_id else {"vehicle_id": {"$exists": True}}
    if not vehicle_id and vehicle_name:
        query = {"$or": [{"vehicle_id": vehicle_name}, {"vehicle_name": vehicle_name}]}
    telemetry = await telemetry_collection.find_one(query, {"_id": 0})
    sos_events = await trip_events_collection.find(
        {"booking_id": booking_id, "event_type": "sos"},
        {"_id": 0},
    ).sort("created_at", -1).to_list(length=10)
    return {
        "success": True,
        "tracking_available": bool(telemetry),
        "booking_id": booking_id,
        "telemetry": telemetry,
        "sos_events": sos_events,
    }


@app.post("/api/bookings/{booking_id}/sos")
async def create_booking_sos(booking_id: str, request: SOSRequest):
    try:
        booking = await bookings_collection.find_one({"_id": ObjectId(booking_id)}, {"_id": 0})
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid booking ID") from exc
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    event = {
        "event_id": str(uuid4()),
        "event_type": "sos",
        "booking_id": booking_id,
        "vehicle_name": booking.get("vehicle_name") or booking.get("vehicleName", ""),
        "user_email": request.user_email.strip().lower(),
        "message": request.message.strip() or "Customer requested emergency assistance.",
        "emergency_type": request.emergency_type.strip().lower() or "general",
        "latitude": request.latitude,
        "longitude": request.longitude,
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
    }
    await trip_events_collection.insert_one(event)
    await live_fleet_connections.broadcast({"type": "customer_sos", "data": {k: v for k, v in event.items() if k != "_id"}})
    return {"success": True, "message": "SOS alert sent to the RideHub support team.", "event": {k: v for k, v in event.items() if k != "_id"}}


@app.websocket("/ws/fleet-live")
async def fleet_live_socket(websocket: WebSocket):
    await live_fleet_connections.connect(websocket)
    try:
        snapshot = await telemetry_collection.find({}, {"_id": 0}).to_list(length=500)
        await websocket.send_json({"type": "snapshot", "data": snapshot})
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, RuntimeError, OSError):
        live_fleet_connections.disconnect(websocket)

# GET USERS
@app.get("/api/admin/users")
async def get_users():

    users = await users_collection.find(
        {},
        {"_id": 0}
    ).to_list(length=100)

    return {
        "success": True,
        "users": users
    }


@app.post("/api/recommendations")
async def get_vehicle_recommendations(request: RecommendationRequest):
    trip_type = (request.trip_type or "family").strip().lower()
    passengers = max(1, int(request.passengers or 1))
    duration_days = max(1, int(request.duration_days or 1))
    city = (request.city or "Delhi").strip() or "Delhi"
    budget_per_day = request.budget_per_day or 3000

    fallback_vehicles = [
        {"id": 1, "name": "Maruti Swift", "type": "car", "price_per_day": 2500, "seats": 5, "fuel_type": "Petrol", "transmission": "Manual", "features": ["Fuel efficient", "City friendly"]},
        {"id": 2, "name": "Hyundai Creta", "type": "car", "price_per_day": 3800, "seats": 5, "fuel_type": "Petrol", "transmission": "Automatic", "features": ["Comfort ride", "Spacious cabin"]},
        {"id": 3, "name": "Toyota Innova Crysta", "type": "car", "price_per_day": 4800, "seats": 7, "fuel_type": "Diesel", "transmission": "Manual", "features": ["Family trip ready", "Large luggage space"]},
        {"id": 4, "name": "Mahindra Thar", "type": "car", "price_per_day": 4500, "seats": 4, "fuel_type": "Diesel", "transmission": "Manual", "features": ["Off-road capable", "Adventure style"]},
        {"id": 5, "name": "Honda City", "type": "car", "price_per_day": 3000, "seats": 5, "fuel_type": "Petrol", "transmission": "Manual", "features": ["Executive comfort", "Smooth highway drive"]},
        {"id": 6, "name": "Kia Seltos", "type": "car", "price_per_day": 3700, "seats": 5, "fuel_type": "Petrol", "transmission": "Automatic", "features": ["Premium feel", "High safety score"]},
        {"id": 7, "name": "Royal Enfield Classic", "type": "bike", "price_per_day": 1800, "seats": 1, "fuel_type": "Petrol", "transmission": "Manual", "features": ["Easy city riding", "Retro cruiser"]},
        {"id": 8, "name": "TVS Apache RTR 160", "type": "bike", "price_per_day": 2200, "seats": 1, "fuel_type": "Petrol", "transmission": "Manual", "features": ["Sporty comfort", "Great mileage"]},
    ]

    db_vehicles = await vehicles_collection.find({}, {"_id": 0}).to_list(length=50)
    candidates = db_vehicles if db_vehicles else fallback_vehicles

    scored = []
    for vehicle in candidates:
        name = str(vehicle.get("name", "Unknown vehicle"))
        vehicle_type = str(vehicle.get("type") or vehicle.get("vehicle_type") or "car").lower()
        seats = int(vehicle.get("seats") or vehicle.get("capacity") or 4)
        price = float(vehicle.get("price_per_day") or vehicle.get("price") or 0)
        features = vehicle.get("features") or []

        base_score = 50

        if trip_type in {"business", "executive"}:
            if vehicle_type == "car":
                base_score += 15
            if seats >= 4:
                base_score += 10
            if price <= budget_per_day * 1.2:
                base_score += 10
            if "Automatic" in str(vehicle.get("transmission", "")):
                base_score += 8
        elif trip_type in {"family", "vacation"}:
            if seats >= 5:
                base_score += 20
            if vehicle_type == "car":
                base_score += 12
            if price <= budget_per_day * 1.4:
                base_score += 8
        elif trip_type in {"weekend", "city"}:
            if price <= budget_per_day:
                base_score += 18
            if vehicle_type == "car":
                base_score += 10
            if vehicle.get("fuel_type") == "Petrol":
                base_score += 4
        elif trip_type in {"adventure", "offroad"}:
            if "SUV" in name or "Thar" in name or "Fortuner" in name or "XUV" in name:
                base_score += 24
            if seats >= 4:
                base_score += 8
        elif trip_type in {"longtrip", "roadtrip"}:
            if seats >= 5:
                base_score += 15
            if price <= budget_per_day * 1.3:
                base_score += 10
            if len(features) > 0:
                base_score += 5

        if passengers > seats:
            base_score -= 12
        if price > budget_per_day * 1.8:
            base_score -= 15
        if duration_days >= 7 and price <= budget_per_day * 1.1:
            base_score += 10

        if city.lower() in {"delhi", "mumbai", "bangalore", "hyderabad", "pune"} and vehicle_type == "car":
            base_score += 6

        reason = "Balanced for your trip"
        if trip_type == "family":
            reason = "Comfortable option for family travel" if seats >= 5 else "Compact and easy to drive"
        elif trip_type == "business":
            reason = "Premium and efficient for work travel"
        elif trip_type == "adventure":
            reason = "Strong for road trip and rugged routes"
        elif trip_type == "city":
            reason = "Easy parking and lower running cost"
        elif trip_type == "weekend":
            reason = "Great mix of comfort and value"

        score = max(1, min(99, round(base_score)))
        scored.append({
            "id": vehicle.get("id") or name,
            "name": name,
            "type": vehicle_type,
            "price_per_day": price,
            "seats": seats,
            "transmission": vehicle.get("transmission") or "Manual",
            "fuel_type": vehicle.get("fuel_type") or "Petrol",
            "features": features[:3] or [reason],
            "score": score,
            "reason": reason,
        })

    top_recommendations = sorted(scored, key=lambda item: item["score"], reverse=True)[:3]

    return {
        "success": True,
        "trip_type": trip_type,
        "city": city,
        "recommendations": top_recommendations,
    }

# GET BOOKINGS

@app.get("/api/admin/bookings")
async def get_bookings():

    bookings = await bookings_collection.find(
        {},
        {"_id": 0}
    ).sort(
        "_id",
        -1
    ).to_list(length=100)

    return {
        "success": True,
        "bookings": bookings
    }


@app.get("/api/admin/branch-analytics")
async def get_branch_analytics(_: dict = Depends(require_admin)):
    bookings = await bookings_collection.find({}, {"_id": 0}).to_list(length=1000)
    branches = {}
    for booking in bookings:
        pickup = str(booking.get("pickup_branch") or booking.get("pickupBranch") or "Unassigned")
        dropoff = str(booking.get("dropoff_branch") or booking.get("dropoffBranch") or pickup)
        amount = float(booking.get("total_price") or booking.get("totalAmount") or booking.get("total_amount") or 0)
        status = normalize_booking_status(booking.get("status")).lower()
        if status in {"cancelled", "rejected"}:
            amount = 0
        for branch, role in ((pickup, "pickup"), (dropoff, "dropoff")):
            row = branches.setdefault(branch, {"branch": branch, "pickup_bookings": 0, "dropoff_bookings": 0, "one_way_bookings": 0, "revenue": 0})
            row[f"{role}_bookings"] += 1
            if role == "pickup":
                row["revenue"] += amount
                if booking.get("one_way"):
                    row["one_way_bookings"] += 1
    rows = sorted(branches.values(), key=lambda row: row["revenue"], reverse=True)
    for row in rows:
        row["revenue"] = round(row["revenue"], 2)
    return {"success": True, "branches": rows, "total_revenue": round(sum(row["revenue"] for row in rows), 2)}

@app.get("/api/vehicles/{vehicle_id}/availability")
async def check_vehicle_availability(vehicle_id: str, start_date: str, end_date: str):
    if not start_date or not end_date:
        raise HTTPException(
            status_code=400,
            detail="Both start_date and end_date are required."
        )

    if parse_booking_date(start_date) > parse_booking_date(end_date):
        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date."
        )

    conflicts = await get_vehicle_booking_conflicts(vehicle_id, start_date, end_date)

    return {
        "success": True,
        "available": len(conflicts) == 0,
        "conflicts": conflicts
    }


@app.post("/api/pricing/calculate")
async def calculate_dynamic_pricing(payload: DynamicPricingRequest):
    if payload.base_price <= 0:
        raise HTTPException(status_code=400, detail="Base price must be greater than zero.")

    breakdown = get_day_pricing_breakdown(payload.base_price, payload.start_date, payload.end_date)
    discount_percent = 0
    if payload.promo_code:
        promo = await promos_collection.find_one({"code": payload.promo_code.strip().upper()})
        if promo:
            discount_percent = float(promo.get("discount_percent", 0))
        else:
            discount_percent = 0

    total_after_discount = breakdown["subtotal"] * (1 - (discount_percent / 100))

    return {
        "success": True,
        "days": breakdown["days"],
        "base_subtotal": breakdown["base_subtotal"],
        "weekend_surcharge": breakdown["weekend_surcharge"],
        "peak_surcharge": breakdown["peak_surcharge"],
        "subtotal": breakdown["subtotal"],
        "discount_percent": discount_percent,
        "discount_amount": round(breakdown["subtotal"] * (discount_percent / 100), 2),
        "total_price": round(total_after_discount, 2),
    }


@app.post("/api/pricing/predictive")
async def calculate_predictive_pricing(payload: PredictivePricingRequest):
    if not payload.start_date or not payload.end_date:
        raise HTTPException(status_code=400, detail="Start date and end date are required.")

    if parse_booking_date(payload.start_date) > parse_booking_date(payload.end_date):
        raise HTTPException(status_code=400, detail="End date cannot be earlier than start date.")

    result = calculate_predictive_price(
        base_price=payload.base_price,
        start_date=payload.start_date,
        end_date=payload.end_date,
        city=payload.city,
        vehicle_type=payload.vehicle_type,
    )

    return {
        "success": True,
        **result,
    }


@app.post("/api/corporate/bookings")
async def create_corporate_booking(payload: CorporateBookingRequest):
    if not payload.company_name.strip():
        raise HTTPException(status_code=400, detail="Company name is required.")
    if not payload.company_email.strip():
        raise HTTPException(status_code=400, detail="Company email is required.")
    if not payload.contact_person.strip():
        raise HTTPException(status_code=400, detail="Contact person is required.")

    start_date = parse_booking_date(payload.start_date)
    end_date = parse_booking_date(payload.end_date)
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="End date cannot be earlier than start date.")

    total_days = (end_date - start_date).days + 1
    estimated_daily_price = 3500.0 if payload.vehicle_type.lower() == "car" else 1800.0
    subtotal = estimated_daily_price * total_days
    gst_amount = subtotal * 0.18
    total_amount = subtotal + gst_amount

    invoice_number = f"CORP-{datetime.utcnow().strftime('%Y%m%d')}-{abs(hash(payload.company_name.lower())) % 10000:04d}"

    record = {
        "company_name": payload.company_name.strip(),
        "company_email": payload.company_email.strip(),
        "contact_person": payload.contact_person.strip(),
        "gst_number": payload.gst_number.strip() if payload.gst_number else "",
        "vehicle_id": payload.vehicle_id,
        "vehicle_name": payload.vehicle_name,
        "vehicle_type": payload.vehicle_type,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "passengers": payload.passengers,
        "billing_cycle": payload.billing_cycle,
        "invoice_required": payload.invoice_required,
        "notes": payload.notes or "",
        "status": "Approved",
        "estimated_daily_price": round(estimated_daily_price, 2),
        "subtotal": round(subtotal, 2),
        "gst_amount": round(gst_amount, 2),
        "total_amount": round(total_amount, 2),
        "invoice_number": invoice_number,
        "created_at": datetime.utcnow().isoformat(),
    }

    return {
        "success": True,
        "message": "Corporate rental request approved successfully.",
        "booking": record,
    }


@app.post("/api/fraud/risk")
async def assess_fraud_risk(payload: FraudRiskRequest):
    email = (payload.email or "").strip().lower()
    phone = (payload.phone or "").strip()
    city = (payload.city or "").strip().lower()
    amount = float(payload.booking_amount or 0)
    days = int(payload.booking_days or 1)
    duplicate_attempts = int(payload.duplicate_attempts or 0)
    verification_status = (payload.verification_status or "pending").strip().lower()

    risk_score = 0
    reasons = []

    if not email or "@" not in email:
        risk_score += 15
        reasons.append("Invalid email format")
    if not phone or len(phone) < 10:
        risk_score += 10
        reasons.append("Phone not verified")
    if duplicate_attempts >= 2:
        risk_score += 25
        reasons.append("Multiple booking attempts detected")
    if verification_status in {"pending", "unverified"}:
        risk_score += 20
        reasons.append("Verification not complete")
    if city in {"delhi", "mumbai", "bangalore"} and amount > 20000:
        risk_score += 10
        reasons.append("High-value booking in active city")
    if days > 14 and amount > 15000:
        risk_score += 10
        reasons.append("Long high-value rental pattern")
    if payload.vehicle_id and not str(payload.vehicle_id).strip():
        risk_score += 5
        reasons.append("Missing vehicle reference")

    if risk_score >= 60:
        verdict = "high"
        action = "Manual review required"
    elif risk_score >= 35:
        verdict = "medium"
        action = "Extra verification recommended"
    else:
        verdict = "low"
        action = "Proceed normally"

    return {
        "success": True,
        "risk_score": min(100, risk_score),
        "verdict": verdict,
        "action": action,
        "reasons": reasons or ["No obvious risk factors detected"],
    }


SERVICE_CITIES = {
    "delhi", "mumbai", "bangalore", "hyderabad", "pune",
    "chennai", "jaipur", "goa", "kolkata", "ahmedabad"
}

RESTRICTED_ZONES = [
    {"name": "Airport restricted operations zone", "latitude": 28.5562, "longitude": 77.1000, "radius_km": 1.5},
    {"name": "Port and cargo restricted zone", "latitude": 19.0760, "longitude": 72.8777, "radius_km": 1.0},
]


def distance_in_km(latitude_one: float, longitude_one: float, latitude_two: float, longitude_two: float):
    earth_radius_km = 6371.0
    lat_delta = radians(latitude_two - latitude_one)
    lon_delta = radians(longitude_two - longitude_one)
    value = (
        sin(lat_delta / 2) ** 2
        + cos(radians(latitude_one)) * cos(radians(latitude_two)) * sin(lon_delta / 2) ** 2
    )
    return earth_radius_km * 2 * asin(sqrt(value))


@app.post("/api/geofence/check")
async def check_geofence(payload: GeofenceCheckRequest):
    city = (payload.city or "").strip().lower()
    if not city:
        raise HTTPException(status_code=400, detail="City is required for geofence validation.")

    if payload.latitude is not None and not -90 <= payload.latitude <= 90:
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90.")
    if payload.longitude is not None and not -180 <= payload.longitude <= 180:
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180.")

    warnings = []
    restricted_zone = None
    if payload.latitude is not None and payload.longitude is not None:
        for zone in RESTRICTED_ZONES:
            if distance_in_km(
                payload.latitude,
                payload.longitude,
                zone["latitude"],
                zone["longitude"],
            ) <= zone["radius_km"]:
                restricted_zone = zone
                break

    if restricted_zone:
        return {
            "success": True,
            "allowed": False,
            "status": "blocked",
            "service_area": city in SERVICE_CITIES,
            "message": f"Pickup is not allowed inside the {restricted_zone['name']}.",
            "zone": restricted_zone["name"],
        }

    if city not in SERVICE_CITIES:
        warnings.append("This city is outside the standard service area and may require manual approval.")

    if payload.latitude is None or payload.longitude is None:
        warnings.append("Select the pickup point on the map for a more accurate location check.")

    return {
        "success": True,
        "allowed": True,
        "status": "review" if warnings else "approved",
        "service_area": city in SERVICE_CITIES,
        "message": warnings[0] if warnings else "Pickup location is inside the supported rental network.",
        "warnings": warnings,
    }


# CREATE BOOKING

@app.post("/api/bookings")
async def create_booking(
    booking: BookingModel
):

    booking_data = booking.model_dump()

    if parse_booking_date(booking.start_date) > parse_booking_date(booking.end_date):
        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date."
        )

    conflicts = await get_vehicle_booking_conflicts(
        booking.vehicle_id,
        booking.start_date,
        booking.end_date
    )

    if conflicts:
        raise HTTPException(
            status_code=409,
            detail="Vehicle is already booked for the selected dates. Please choose a different date range."
        )

    # Booking status

    booking_data["status"] = "pending"

    # Payment initially pending
    booking_data["paymentStatus"] = "Pending"

    booking_data["bookingStatus"] = "Pending"

    booking_data["paymentId"] = None

    booking_data["paidAt"] = None

    # Extension

    booking_data["extended"] = False

    # Save booking

    result = await bookings_collection.insert_one(
        booking_data
    )

    # Mark vehicle as booked

    await vehicles_collection.update_one(
        {
            "name": booking.vehicle_name
        },
        {
            "$set": {
                "status": "booked",
                "isBooked": True
            }
        }
    )


    return {
        "success": True,
        "message": "Booking saved successfully!",
        "booking_id": str(result.inserted_id)
    }


@app.get("/api/bookings/{booking_id}/late-fee")
async def calculate_late_fee(booking_id: str, returned_at: str):
    try:
        booking = await bookings_collection.find_one({"_id": ObjectId(booking_id)})
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid booking ID") from exc
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    try:
        due = datetime.fromisoformat(f"{booking['end_date']}T{booking.get('return_time') or '10:00'}")
        actual = datetime.fromisoformat(returned_at)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid booking or return time") from exc
    late_hours = max(0, (actual - due).total_seconds() / 3600)
    hourly_rate = float(booking.get("rate_per_day") or booking.get("total_price", 0)) / 8
    return {"success": True, "late_hours": round(late_hours, 2), "late_fee": round(late_hours * hourly_rate, 2)}

# CREATE STRIPE PAYMENT INTENT

@app.post("/api/create-payment-intent")
async def create_payment_intent(
    payment: PaymentIntentModel
):

    # Validate amount

    if payment.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment amount"
        )

    # Validate booking ID
    try:

        booking_object_id = ObjectId(
            payment.booking_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID"
        )

    # Check booking

    booking = await bookings_collection.find_one({
        "_id": booking_object_id
    })


    if booking is None:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # Stripe amount
    # INR amount ₹100 = 10000 paise

    amount_paise = int(
        round(payment.amount * 100)
    )


    try:

        intent = stripe.PaymentIntent.create(
            amount=amount_paise,
            currency=payment.currency.lower(),
            receipt_email=(
                payment.email
                if payment.email
                else None
            ),
            metadata={
                "booking_id": payment.booking_id,
                "vehicle_name": str(
                    booking.get(
                        "vehicle_name",
                        ""
                    )
                )
            }
        )


    except Exception as e:

        print(
            "STRIPE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create Stripe payment"
        )

    # Save PaymentIntent ID in MongoDB

    await bookings_collection.update_one(
        {
            "_id": booking_object_id
        },
        {
            "$set": {
                "stripePaymentIntentId": intent.id,
                "paymentStatus": "Pending",
                "securityDeposit": round(max(0, payment.security_deposit), 2),
                "depositStatus": "authorized" if payment.security_deposit > 0 else "not_required",
                "ledger": [{
                    "type": "rental_charge",
                    "amount": round(payment.amount, 2),
                    "status": "pending",
                    "created_at": datetime.utcnow().isoformat(),
                }]
            }
        }
    )


    return {
        "success": True,
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id
    }


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret is not configured.")
    try:
        event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature.") from exc
    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        booking_id = intent.get("metadata", {}).get("booking_id")
        if booking_id:
            await bookings_collection.update_one(
                {"_id": ObjectId(booking_id)},
                {"$set": {"paymentStatus": "Paid", "paymentId": intent.get("id"), "paidAt": datetime.utcnow().isoformat()}},
            )
    return {"received": True}


@app.get("/api/bookings/{booking_id}/deposit-ledger")
async def get_deposit_ledger(booking_id: str):
    try:
        booking = await bookings_collection.find_one({"_id": ObjectId(booking_id)}, {"_id": 0})
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid booking ID") from exc
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {
        "success": True,
        "security_deposit": booking.get("securityDeposit", 0),
        "deposit_status": booking.get("depositStatus", "not_required"),
        "ledger": booking.get("ledger", []),
    }

# UPDATE BOOKING PAYMENT

@app.put("/api/bookings/{booking_id}/payment")
async def update_booking_payment(
    booking_id: str,
    payment: PaymentUpdateModel
):

    # Convert MongoDB ID

    try:

        booking_object_id = ObjectId(
            booking_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID"
        )

    current_booking = await bookings_collection.find_one({
        "_id": booking_object_id
    })

    if current_booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    normalized_payment_status = normalize_booking_status(payment.payment_status)
    normalized_booking_status = normalize_booking_status(payment.booking_status)

    if normalized_booking_status == "Payment Received":
        final_status = "Payment Received"
    elif normalized_booking_status in {"Confirmed", "Active", "Completed", "Cancelled", "Overdue", "Rejected"}:
        final_status = normalized_booking_status
    else:
        final_status = normalize_booking_status(current_booking.get("status", "Pending"))

    result = await bookings_collection.update_one(
        {
            "_id": booking_object_id
        },
        {
            "$set": {
                "paymentStatus": normalized_payment_status,
                "bookingStatus": normalized_booking_status,
                "status": final_status,
                "paymentId": payment.payment_id,
                "paidAt": payment.paid_at
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    booking = await bookings_collection.find_one({
        "_id": booking_object_id
    })


    if booking:

        vehicle_name = booking.get(
            "vehicle_name"
        )

        if vehicle_name:

            await vehicles_collection.update_one(
                {
                    "name": vehicle_name
                },
                {
                    "$set": {
                        "status": "booked",
                        "isBooked": True
                    }
                }
            )


    return {
        "success": True,
        "message": "Payment status updated successfully",
        "booking_id": booking_id,
        "paymentStatus": normalized_payment_status,
        "bookingStatus": normalized_booking_status,
        "status": final_status,
        "paymentId": payment.payment_id,
        "paidAt": payment.paid_at
    }


@app.put("/api/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, payload: BookingStatusUpdateModel):
    try:
        booking_object_id = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_collection.find_one({"_id": booking_object_id})
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    current_status = normalize_booking_status(booking.get("status", "Pending"))
    next_status = normalize_booking_status(payload.status)

    if current_status in BOOKING_STATUS_FLOW and next_status not in BOOKING_STATUS_FLOW.get(current_status, set()):
        if current_status != next_status:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from {current_status} to {next_status}."
            )

    update_fields = {
        "status": next_status,
        "bookingStatus": next_status,
    }

    if payload.payment_status is not None:
        update_fields["paymentStatus"] = normalize_booking_status(payload.payment_status)

    if payload.booking_status is not None:
        update_fields["bookingStatus"] = normalize_booking_status(payload.booking_status)

    result = await bookings_collection.update_one({"_id": booking_object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "success": True,
        "message": "Booking status updated successfully",
        "booking_id": booking_id,
        "status": next_status,
        "bookingStatus": update_fields.get("bookingStatus", next_status),
        "paymentStatus": update_fields.get("paymentStatus")
    }


@app.get("/api/users/{email}/bookings")
async def get_user_bookings(email: str):
    user_email = email.strip().lower()
    bookings = await bookings_collection.find({"user_email": user_email}, {"_id": 0}).sort("_id", -1).to_list(length=100)
    return {"success": True, "bookings": bookings}


@app.post("/api/bookings/{booking_id}/damage")
async def create_damage_report(booking_id: str, report: DamageReportModel):
    try:
        booking_obj_id = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    existing_booking = await bookings_collection.find_one({"_id": booking_obj_id})
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    damage_data = report.model_dump()
    damage_data["booking_id"] = booking_id
    damage_data["created_at"] = datetime.utcnow().isoformat()
    damage_data["status"] = "Pending Review"

    await bookings_collection.update_one(
        {"_id": booking_obj_id},
        {"$set": {"damageReport": damage_data, "damageStatus": "Pending Review"}}
    )

    return {
        "success": True,
        "message": "Damage report submitted successfully",
        "status": "Pending Review"
    }


@app.get("/api/bookings/{booking_id}/damage")
async def get_damage_reports(booking_id: str):
    try:
        booking_obj_id = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_collection.find_one({"_id": booking_obj_id}, {"damageReport": 1})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "success": True,
        "damage_report": booking.get("damageReport")
    }


@app.post("/api/bookings/{booking_id}/inspection")
async def create_booking_inspection(booking_id: str, inspection: BookingInspectionModel):
    if inspection.inspection_type not in INSPECTION_TYPES:
        raise HTTPException(status_code=400, detail="Inspection type must be check_in or check_out.")
    if inspection.odometer < 0:
        raise HTTPException(status_code=400, detail="Odometer cannot be negative.")
    if inspection.fuel_level < 0 or inspection.fuel_level > 100:
        raise HTTPException(status_code=400, detail="Fuel level must be between 0 and 100.")
    if not inspection.confirmed:
        raise HTTPException(status_code=400, detail="Please confirm the inspection details.")
    try:
        booking_object_id = ObjectId(booking_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid booking ID.") from exc

    booking = await bookings_collection.find_one(
        {"_id": booking_object_id},
        {"vehicle_name": 1, "vehicle_id": 1},
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    vehicle_type = str(booking.get("vehicle_type") or "").lower()
    if vehicle_type == "bike":
        if inspection.helmet_count_issued < 0 or inspection.helmet_count_returned < 0:
            raise HTTPException(status_code=400, detail="Helmet counts cannot be negative.")
        if inspection.helmet_count_returned > inspection.helmet_count_issued:
            raise HTTPException(status_code=400, detail="Returned helmets cannot exceed issued helmets.")
        if not inspection.safety_confirmed:
            raise HTTPException(status_code=400, detail="Please confirm the bike safety checklist.")

    inspection_data = inspection.model_dump()
    inspection_data["booking_id"] = booking_id
    inspection_data["vehicle_name"] = booking.get("vehicle_name", "Vehicle")
    inspection_data["vehicle_id"] = booking.get("vehicle_id")
    inspection_data["created_at"] = datetime.utcnow().isoformat()

    await inspection_collection.insert_one(inspection_data)
    await bookings_collection.update_one(
        {"_id": booking_object_id},
        {"$set": {f"inspection_{inspection.inspection_type}": inspection_data}},
    )

    return {
        "success": True,
        "message": f"{inspection.inspection_type.replace('_', ' ').title()} inspection saved.",
        "inspection": {key: value for key, value in inspection_data.items() if key != "_id"},
    }


@app.get("/api/bookings/{booking_id}/inspection/comparison")
async def compare_booking_inspections(booking_id: str):
    inspections = await inspection_collection.find(
        {"booking_id": booking_id},
        {"_id": 0},
    ).sort("created_at", 1).to_list(length=10)
    check_in = next((item for item in inspections if item.get("inspection_type") == "check_in"), None)
    check_out = next((item for item in reversed(inspections) if item.get("inspection_type") == "check_out"), None)
    if not check_in or not check_out:
        return {"success": True, "comparison_available": False, "message": "Pickup and return inspections are both required."}

    baseline_words = {word.strip(".,:;!?").lower() for word in str(check_in.get("condition_notes", "")).split() if len(word) > 3}
    return_words = {word.strip(".,:;!?").lower() for word in str(check_out.get("condition_notes", "")).split() if len(word) > 3}
    new_damage = sorted(return_words - baseline_words)
    missing_helmets = max(0, int(check_out.get("helmet_count_issued", 0)) - int(check_out.get("helmet_count_returned", 0)))
    fuel_delta = round(float(check_out.get("fuel_level", 0)) - float(check_in.get("fuel_level", 0)), 1)
    odometer_delta = round(float(check_out.get("odometer", 0)) - float(check_in.get("odometer", 0)), 1)
    adjustment = round(max(0, missing_helmets * 750) + max(0, -fuel_delta) * 12 + len(new_damage) * 500, 2)
    return {
        "success": True,
        "comparison_available": True,
        "booking_id": booking_id,
        "fuel_delta_percent": fuel_delta,
        "distance_travelled_km": max(0, odometer_delta),
        "new_damage_indicators": new_damage,
        "missing_helmets": missing_helmets,
        "deposit_adjustment_estimate": adjustment,
        "recommendation": "Manual review required" if new_damage or missing_helmets else "No new damage indicators found",
    }


@app.get("/api/bookings/{booking_id}/inspection")
async def get_booking_inspections(booking_id: str):
    inspections = await inspection_collection.find(
        {"booking_id": booking_id},
        {"_id": 0},
    ).sort("created_at", -1).to_list(length=10)
    return {"success": True, "inspections": inspections}

# REVIEWS API

@app.post("/api/reviews")
async def add_review(review: ReviewModel):
    review_data = review.model_dump()
    result = await reviews_collection.insert_one(review_data)
    return {"success": True, "message": "Review added successfully"}

@app.get("/api/reviews/{vehicle_name}")
async def get_reviews(vehicle_name: str):
    reviews = await reviews_collection.find({"vehicle_name": vehicle_name}, {"_id": 0}).to_list(length=100)
    return {"success": True, "reviews": reviews}

# PROMO API

@app.post("/api/promo/validate")
async def validate_promo(promo: PromoModel):
    # Mocking promo logic
    valid_promos = {
        "FESTIVAL20": 20,
        "WELCOME10": 10
    }
    code = promo.code.upper()
    if code in valid_promos:
        return {"success": True, "discount_percentage": valid_promos[code]}
    raise HTTPException(status_code=400, detail="Invalid promo code")

# DOCUMENT VERIFICATION API

@app.get("/api/users/{user_identifier}/verification")
async def get_user_verification(user_identifier: str):
    user = None
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_identifier)})
    except Exception:
        user = None

    if user is None:
        user = await users_collection.find_one({"email": user_identifier.strip().lower()})

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    status_value = user.get("verificationStatus") or user.get("docStatus") or "Unverified"
    return {
        "success": True,
        "verificationStatus": status_value,
        "docStatus": status_value,
        "documentUrl": user.get("documentUrl", "")
    }


@app.put("/api/users/{user_identifier}/verification")
async def save_user_verification(user_identifier: str, payload: UserVerificationModel):
    user = None
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_identifier)})
    except Exception:
        user = None

    if user is None:
        user = await users_collection.find_one({"email": user_identifier.strip().lower()})

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {}
    if payload.documentUrl is not None:
        update_data["documentUrl"] = payload.documentUrl
    if payload.verificationStatus is not None:
        update_data["verificationStatus"] = payload.verificationStatus
        update_data["docStatus"] = payload.verificationStatus

    if not update_data:
        return {"success": True, "message": "No verification update provided"}

    await users_collection.update_one({"_id": user["_id"]}, {"$set": update_data})
    return {"success": True, "message": "Verification updated successfully", **update_data}


@app.put("/api/admin/users/{user_identifier}/verify")
async def verify_user_doc(user_identifier: str, doc: DocVerifyModel):
    status_value = (doc.status or doc.docStatus or "Pending Review").strip()

    user = None
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_identifier)})
    except Exception:
        user = None

    if user is None:
        user = await users_collection.find_one({"email": user_identifier.strip().lower()})

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"docStatus": status_value, "verificationStatus": status_value}}
    )
    return {"success": True, "message": f"Document status updated to {status_value}", "verificationStatus": status_value}

# CANCELLATION API

@app.get("/api/bookings/{booking_id}/refund-policy")
async def get_refund_policy(booking_id: str):
    try:
        booking_obj_id = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_collection.find_one({"_id": booking_obj_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    start_date = parse_booking_date(booking.get("start_date", ""))
    today = datetime.utcnow().date()
    days_until_pickup = (start_date - today).days

    if days_until_pickup >= 7:
        refund_percent = 100
        policy = "Full refund"
    elif days_until_pickup >= 3:
        refund_percent = 75
        policy = "75% refund"
    elif days_until_pickup >= 1:
        refund_percent = 50
        policy = "50% refund"
    else:
        refund_percent = 0
        policy = "No refund"

    return {
        "success": True,
        "booking_id": booking_id,
        "days_until_pickup": days_until_pickup,
        "refund_percent": refund_percent,
        "policy": policy,
        "currency": "INR"
    }


@app.post("/api/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, payload: CancellationPolicyModel | None = None):
    try:
        booking_obj_id = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_collection.find_one({"_id": booking_obj_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    start_date = booking.get("start_date")
    end_date = booking.get("end_date")
    total_price = float(booking.get("total_price", 0) or 0)

    if start_date:
        days_until_pickup = (parse_booking_date(start_date) - datetime.utcnow().date()).days
    else:
        days_until_pickup = 0

    if days_until_pickup >= 7:
        refund_percent = 100
    elif days_until_pickup >= 3:
        refund_percent = 75
    elif days_until_pickup >= 1:
        refund_percent = 50
    else:
        refund_percent = 0

    refund_amount = round(total_price * (refund_percent / 100), 2)

    await bookings_collection.update_one(
        {"_id": booking_obj_id},
        {"$set": {
            "status": "Cancelled",
            "bookingStatus": "Cancelled",
            "paymentStatus": "Refunded",
            "refundPercent": refund_percent,
            "refundAmount": refund_amount,
            "cancelReason": payload.reason if payload else "Customer requested cancellation",
            "cancelledAt": datetime.utcnow().isoformat()
        }}
    )

    vehicle_name = booking.get("vehicle_name")
    if vehicle_name:
        await vehicles_collection.update_one(
            {"name": vehicle_name},
            {"$set": {"status": "available", "isBooked": False}}
        )

    print(f"MOCK: Refund initiated for booking {booking_id}, refund={refund_amount}, percent={refund_percent}%")
    print(f"MOCK Email sent to user for cancellation of {booking_id}")

    return {
        "success": True,
        "message": "Booking cancelled successfully.",
        "refund_percent": refund_percent,
        "refund_amount": refund_amount,
        "payment_status": "Refunded",
        "status": "Cancelled"
    }

# MOCK EMAIL NOTIFICATION (Can be called internally)
async def send_email_notification(to_email: str, subject: str, body: str):
    print(f"--- MOCK EMAIL TO: {to_email} ---")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("-----------------------------------")


@app.post("/api/notifications/send")
async def send_notification(notification: NotificationModel):
    target_email = notification.user_email.strip().lower() if notification.user_email else "guest@gmail.com"
    print(f"--- MOCK {notification.channel.upper()} NOTIFICATION ---")
    print(f"Type: {notification.type}")
    print(f"To: {target_email}")
    print(f"Title: {notification.title}")
    print(f"Message: {notification.message}")
    print("-----------------------------------------------")

    return {
        "success": True,
        "message": "Notification sent successfully",
        "type": notification.type,
        "channel": notification.channel,
        "user_email": target_email
    }


@app.post("/api/bookings/{booking_id}/notify")
async def send_booking_notification(booking_id: str, notification: NotificationModel):
    target_email = notification.user_email.strip().lower() if notification.user_email else "guest@gmail.com"
    payload = {
        "booking_id": booking_id,
        "user_email": target_email,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "channel": notification.channel
    }
    print(f"--- BOOKING NOTIFICATION FOR {booking_id} ---")
    print(payload)
    return {"success": True, "notification": payload}


# ─────────────────────────────────────────────────────────────
# 📅 FEATURE 2: BOOKING EXTENSION API
# ─────────────────────────────────────────────────────────────

class ExtendBookingModel(BaseModel):
    new_end_date: str
    extra_amount: float = 0.0

@app.put("/api/bookings/{booking_id}/extend")
async def extend_booking(booking_id: str, data: ExtendBookingModel):
    try:
        booking_obj_id = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_collection.find_one({"_id": booking_obj_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    result = await bookings_collection.update_one(
        {"_id": booking_obj_id},
        {
            "$set": {
                "end_date": data.new_end_date,
                "total_price": booking.get("total_price", 0) + data.extra_amount,
                "extended": True
            }
        }
    )
    return {
        "success": True,
        "message": "Booking extended successfully",
        "new_end_date": data.new_end_date,
        "extra_amount": data.extra_amount
    }


# ─────────────────────────────────────────────────────────────
# 💰 FEATURE 3: WALLET & LOYALTY POINTS API
# ─────────────────────────────────────────────────────────────

wallet_collection = db["wallets"]

class WalletCreditModel(BaseModel):
    points: int
    reason: str = "Booking completed"

class WalletRedeemModel(BaseModel):
    points: int

@app.get("/api/users/{email}/wallet")
async def get_wallet(email: str):
    email = email.strip().lower()
    wallet = await wallet_collection.find_one({"email": email}, {"_id": 0})
    if not wallet:
        return {"success": True, "points": 0, "history": []}
    return {"success": True, "points": wallet.get("points", 0), "history": wallet.get("history", [])}


@app.get("/api/users/{email}/loyalty")
async def get_loyalty_summary(email: str):
    email = email.strip().lower()
    wallet = await wallet_collection.find_one({"email": email}, {"_id": 0}) or {}
    completed = await bookings_collection.count_documents({
        "$or": [{"user_email": email}, {"userEmail": email}],
        "status": {"$in": ["Confirmed", "confirmed", "Completed", "completed"]},
    })
    points = int(wallet.get("points", 0) or 0)
    if completed >= 10 or points >= 2000:
        tier, next_target, multiplier = "Platinum", 0, 2.0
    elif completed >= 5 or points >= 750:
        tier, next_target, multiplier = "Gold", 10, 1.5
    elif completed >= 2 or points >= 250:
        tier, next_target, multiplier = "Silver", 5, 1.25
    else:
        tier, next_target, multiplier = "Explorer", 2, 1.0
    return {
        "success": True,
        "tier": tier,
        "completed_bookings": completed,
        "points": points,
        "points_multiplier": multiplier,
        "next_tier_booking_target": next_target,
        "benefits": {
            "Explorer": "Earn standard points on completed car and bike rentals.",
            "Silver": "25% bonus points and priority support.",
            "Gold": "50% bonus points and early access to vehicle offers.",
            "Platinum": "2x points and priority vehicle upgrades.",
        }[tier],
    }

@app.post("/api/users/{email}/wallet/credit")
async def credit_wallet(email: str, data: WalletCreditModel):
    email = email.strip().lower()
    from datetime import datetime
    entry = {"type": "credit", "points": data.points, "reason": data.reason, "date": datetime.now().isoformat()}
    wallet = await wallet_collection.find_one({"email": email})
    if wallet:
        await wallet_collection.update_one(
            {"email": email},
            {"$inc": {"points": data.points}, "$push": {"history": entry}}
        )
    else:
        await wallet_collection.insert_one({"email": email, "points": data.points, "history": [entry]})
    return {"success": True, "message": f"{data.points} points credited!"}

@app.post("/api/users/{email}/wallet/redeem")
async def redeem_wallet(email: str, data: WalletRedeemModel):
    email = email.strip().lower()
    wallet = await wallet_collection.find_one({"email": email})
    if not wallet or wallet.get("points", 0) < data.points:
        raise HTTPException(status_code=400, detail="Insufficient points")
    from datetime import datetime
    entry = {"type": "debit", "points": data.points, "reason": "Points redeemed", "date": datetime.now().isoformat()}
    await wallet_collection.update_one(
        {"email": email},
        {"$inc": {"points": -data.points}, "$push": {"history": entry}}
    )
    return {"success": True, "message": f"{data.points} points redeemed!", "discount": data.points}


# ─────────────────────────────────────────────────────────────
# 📷 FEATURE 6: DAMAGE REPORT API
# ─────────────────────────────────────────────────────────────

damage_collection = db["damage_reports"]

class DamageReportModel(BaseModel):
    booking_id: str
    vehicle_name: str
    user_email: str
    report_type: str  # "pre_ride" or "post_ride"
    description: str
    damage_spots: list = []  # list of { x, y, label }

@app.post("/api/bookings/{booking_id}/damage")
async def create_damage_report(booking_id: str, report: DamageReportModel):
    from datetime import datetime
    data = report.model_dump()
    data["createdAt"] = datetime.now().isoformat()
    await damage_collection.insert_one(data)
    return {"success": True, "message": "Damage report saved successfully"}

@app.get("/api/bookings/{booking_id}/damage")
async def get_damage_reports(booking_id: str):
    reports = await damage_collection.find({"booking_id": booking_id}, {"_id": 0}).to_list(length=20)
    return {"success": True, "reports": reports}


# DASHBOARD ROUTER

app.include_router(
    dashboard_router
)