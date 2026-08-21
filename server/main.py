from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dashboard_routes import router as dashboard_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["rental_car_db"]

admins_collection = db["admins"]


# =========================
# MODELS
# =========================

class AdminLogin(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserModel(BaseModel):
    name: str
    email: str
    password: str


class VehicleModel(BaseModel):
    name: str
    brand: str
    price_per_day: float
    car_number: str = "N/A"
    type: str = "car"
    status: str = "available"


class BookingModel(BaseModel):
    user_email: str = "guest@gmail.com"
    vehicle_id: str
    vehicle_name: str
    vehicle_type: str
    start_date: str
    end_date: str
    total_days: int
    total_price: float


# =========================
# ADMIN LOGIN
# =========================

@app.post("/api/admin/login")
async def admin_login(data: AdminLogin):

    admin = await admins_collection.find_one({
        "username": data.username
    })

    if admin and admin["password"] == data.password:
        return {
            "success": True,
            "message": "Login successful",
            "token": "sample_jwt_token_12345"
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid username or password"
    )


# =========================
# USER LOGIN
# =========================

@app.post("/api/login")
async def user_login(data: UserLogin):

    user = await db.users.find_one({
        "email": data.email
    })

    if user and user["password"] == data.password:

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "name": user["name"],
                "email": user["email"]
            }
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


# =========================
# USER REGISTER
# =========================

@app.post("/api/register")
async def register_user(user: UserModel):

    existing_user = await db.users.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_data = user.model_dump()

    result = await db.users.insert_one(user_data)

    return {
        "success": True,
        "message": "User registered successfully!",
        "user_id": str(result.inserted_id)
    }


# =========================
# ADD VEHICLE
# =========================

@app.post("/api/admin/vehicles")
async def add_vehicle(vehicle: VehicleModel):

    vehicle_data = vehicle.model_dump()

    result = await db.vehicles.insert_one(vehicle_data)

    return {
        "success": True,
        "message": "Vehicle added successfully!",
        "id": str(result.inserted_id)
    }


# =========================
# GET VEHICLES
# =========================

@app.get("/api/admin/vehicles")
async def get_vehicles():

    vehicles = await db.vehicles.find(
        {},
        {"_id": 0}
    ).to_list(length=100)

    return {
        "success": True,
        "cars": vehicles
    }


# =========================
# GET USERS
# =========================

@app.get("/api/admin/users")
async def get_users():

    users = await db.users.find(
        {},
        {"_id": 0}
    ).to_list(length=100)

    return {
        "success": True,
        "users": users
    }


# =========================
# GET BOOKINGS
# =========================

@app.get("/api/admin/bookings")
async def get_bookings():

    bookings = await db.bookings.find(
        {},
        {"_id": 0}
    ).sort("_id", -1).to_list(length=100)

    return {
        "success": True,
        "bookings": bookings
    }


# =========================
# CREATE BOOKING
# =========================

@app.post("/api/bookings")
async def create_booking(booking: BookingModel):

    booking_data = booking.model_dump()

    # Important status for dashboard
    booking_data["status"] = "pending"

    # Extension default
    booking_data["extended"] = False

    # Save booking
    result = await db.bookings.insert_one(booking_data)

    # Mark vehicle as booked
    await db.vehicles.update_one(
        {"name": booking.vehicle_name},
        {
            "$set": {
                "status": "booked",
                "isBooked": True
            }
        }
    )

    return {
        "success": True,
        "message": "Booking confirmed and saved successfully!",
        "booking_id": str(result.inserted_id)
    }


# =========================
# DASHBOARD ROUTER
# =========================

app.include_router(dashboard_router)