from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dashboard_routes import router as dashboard_router

import stripe
from bson import ObjectId


app = FastAPI()


# =====================================================
# STRIPE
# =====================================================
# IMPORTANT:
# Yahan Stripe TEST SECRET KEY lagani hai.
# Secret key React/frontend me KABHI mat lagana.
#
# Example:
# stripe.api_key = "sk_test_xxxxxxxxxxxxx"
#
stripe.api_key = "sk_test_51U8au0RpTYjY22GQsSuCBmcnGTVH1dHX4HGnBayvhuo6ro6L1mTyQo3G7r8yXcxgFmRQnIHt6j55oIqDPQ0UTFsZ00dtjdKDMJ"


# =====================================================
# CORS
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# MONGODB
# =====================================================
client = AsyncIOMotorClient(
    "mongodb://localhost:27017"
)

db = client["rental_car_db"]

admins_collection = db["admins"]
users_collection = db["users"]
vehicles_collection = db["vehicles"]
bookings_collection = db["bookings"]


# =====================================================
# MODELS
# =====================================================

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


class BookingModel(BaseModel):
    user_email: str = "guest@gmail.com"
    vehicle_id: str
    vehicle_name: str
    vehicle_type: str
    start_date: str
    end_date: str
    total_days: int
    total_price: float


# =====================================================
# PAYMENT MODEL
# =====================================================

class PaymentIntentModel(BaseModel):
    booking_id: str
    amount: float
    currency: str = "inr"
    email: str = ""


class PaymentUpdateModel(BaseModel):
    payment_status: str
    booking_status: str
    payment_id: str
    paid_at: str


# =====================================================
# ADMIN LOGIN
# =====================================================

@app.post("/api/admin/login")
async def admin_login(data: AdminLogin):

    username = data.username.strip()

    admin = await admins_collection.find_one({
        "username": username
    })

    if admin and admin.get("password") == data.password:

        return {
            "success": True,
            "message": "Login successful",
            "role": "admin",
            "token": "sample_jwt_token_12345"
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid username or password"
    )


# =====================================================
# USER LOGIN
# =====================================================

@app.post("/api/login")
async def user_login(data: UserLogin):

    # ---------------------------------------------
    # Email ko clean karo
    # ---------------------------------------------

    email = data.email.strip().lower()
    password = data.password

    print("======================================")
    print("LOGIN ATTEMPT")
    print("Email:", email)
    print("Password:", password)
    print("======================================")


    # ---------------------------------------------
    # FIRST: Exact lowercase email search
    # ---------------------------------------------

    user = await users_collection.find_one({
        "email": email
    })


    # ---------------------------------------------
    # SECOND: Case-insensitive search
    # ---------------------------------------------

    if user is None:

        user = await users_collection.find_one({
            "email": {
                "$regex": f"^{email}$",
                "$options": "i"
            }
        })


    # ---------------------------------------------
    # User mila ya nahi
    # ---------------------------------------------

    if user is None:

        print("USER NOT FOUND:", email)

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # ---------------------------------------------
    # Password check
    # ---------------------------------------------

    stored_password = str(
        user.get("password", "")
    )

    if stored_password != password:

        print("PASSWORD DOES NOT MATCH")
        print("MongoDB password:", stored_password)

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # ---------------------------------------------
    # LOGIN SUCCESS
    # ---------------------------------------------

    print(
        "LOGIN SUCCESS:",
        user.get("email")
    )


    return {
        "success": True,
        "message": "Login successful",
        "role": "user",
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "licenseNo": user.get("licenseNo", "")
        }
    }


# =====================================================
# USER REGISTER
# =====================================================

@app.post("/api/register")
async def register_user(user: UserModel):

    # ---------------------------------------------
    # Clean user data
    # ---------------------------------------------

    name = user.name.strip()
    email = user.email.strip().lower()
    phone = user.phone.strip()
    license_no = user.licenseNo.strip()
    password = user.password


    # ---------------------------------------------
    # Check existing email
    # ---------------------------------------------

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


    # ---------------------------------------------
    # Create user data
    # ---------------------------------------------

    user_data = {
        "name": name,
        "username": name,
        "email": email,
        "phone": phone,
        "licenseNo": license_no,
        "password": password,
        "role": "user",
        "docStatus": "Pending Review"
    }


    # ---------------------------------------------
    # Save in MongoDB
    # ---------------------------------------------

    result = await users_collection.insert_one(
        user_data
    )


    print("======================================")
    print("NEW USER REGISTERED")
    print("Name:", name)
    print("Email:", email)
    print("MongoDB ID:", result.inserted_id)
    print("======================================")


    return {
        "success": True,
        "message": "User registered successfully!",
        "user_id": str(result.inserted_id)
    }


# =====================================================
# ADD VEHICLE
# =====================================================

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


# =====================================================
# GET VEHICLES
# =====================================================

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


# =====================================================
# GET USERS
# =====================================================

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


# =====================================================
# GET BOOKINGS
# =====================================================

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


# =====================================================
# CREATE BOOKING
# =====================================================

@app.post("/api/bookings")
async def create_booking(
    booking: BookingModel
):

    booking_data = booking.model_dump()


    # ---------------------------------------------
    # Booking status
    # ---------------------------------------------

    booking_data["status"] = "pending"

    # Payment initially pending
    booking_data["paymentStatus"] = "Pending"

    booking_data["bookingStatus"] = "Pending"

    booking_data["paymentId"] = None

    booking_data["paidAt"] = None


    # ---------------------------------------------
    # Extension
    # ---------------------------------------------

    booking_data["extended"] = False


    # ---------------------------------------------
    # Save booking
    # ---------------------------------------------

    result = await bookings_collection.insert_one(
        booking_data
    )


    # ---------------------------------------------
    # Mark vehicle as booked
    # ---------------------------------------------

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


# =====================================================
# CREATE STRIPE PAYMENT INTENT
# =====================================================

@app.post("/api/create-payment-intent")
async def create_payment_intent(
    payment: PaymentIntentModel
):

    # ---------------------------------------------
    # Validate amount
    # ---------------------------------------------

    if payment.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment amount"
        )


    # ---------------------------------------------
    # Validate booking ID
    # ---------------------------------------------

    try:

        booking_object_id = ObjectId(
            payment.booking_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID"
        )


    # ---------------------------------------------
    # Check booking
    # ---------------------------------------------

    booking = await bookings_collection.find_one({
        "_id": booking_object_id
    })


    if booking is None:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # ---------------------------------------------
    # Stripe amount
    #
    # INR amount ₹100 = 10000 paise
    # ---------------------------------------------

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


    # ---------------------------------------------
    # Save PaymentIntent ID in MongoDB
    # ---------------------------------------------

    await bookings_collection.update_one(
        {
            "_id": booking_object_id
        },
        {
            "$set": {
                "stripePaymentIntentId": intent.id,
                "paymentStatus": "Pending"
            }
        }
    )


    return {
        "success": True,
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id
    }


# =====================================================
# UPDATE BOOKING PAYMENT
# =====================================================

@app.put("/api/bookings/{booking_id}/payment")
async def update_booking_payment(
    booking_id: str,
    payment: PaymentUpdateModel
):

    # ---------------------------------------------
    # Convert MongoDB ID
    # ---------------------------------------------

    try:

        booking_object_id = ObjectId(
            booking_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID"
        )


    # ---------------------------------------------
    # Update booking
    # ---------------------------------------------

    result = await bookings_collection.update_one(
        {
            "_id": booking_object_id
        },
        {
            "$set": {
                "paymentStatus": payment.payment_status,
                "bookingStatus": payment.booking_status,
                "status": payment.booking_status,
                "paymentId": payment.payment_id,
                "paidAt": payment.paid_at
            }
        }
    )


    # ---------------------------------------------
    # Booking not found
    # ---------------------------------------------

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # ---------------------------------------------
    # Payment successful
    # Vehicle remains booked
    # ---------------------------------------------

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
        "paymentStatus": payment.payment_status,
        "bookingStatus": payment.booking_status,
        "paymentId": payment.payment_id,
        "paidAt": payment.paid_at
    }


# =====================================================
# DASHBOARD ROUTER
# =====================================================

app.include_router(
    dashboard_router
)