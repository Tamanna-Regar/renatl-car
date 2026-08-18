from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["rental_car_db"]  
admins_collection = db["admins"]  

class AdminLogin(BaseModel):
    username: str
    password: str

# Car data schema
class CarModel(BaseModel):
    name: str
    brand: str
    price_per_day: float
    status: str = "available"  

# Bike data schema
class BikeModel(BaseModel):
    name: str
    brand: str
    price_per_day: float
    status: str = "available"

@app.post("/api/admin/login")
async def admin_login(data: AdminLogin):
    admin = await admins_collection.find_one({"username": data.username})
    
    if admin and admin["password"] == data.password:
        return {
            "success": True,
            "message": "Login successful",
            "token": "sample_jwt_token_12345"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")

# Car APIs
@app.post("/api/admin/cars")
async def add_car(car: CarModel):
    car_data = car.dict()
    result = await db.cars.insert_one(car_data)
    
    return {
        "success": True,
        "message": "Car added successfully!",
        "car_id": str(result.inserted_id)
    }

@app.get("/api/admin/cars")
async def get_cars():
    cars = await db.cars.find({}, {"_id": 0}).to_list(length=100)
    return {"success": True, "cars": cars}

@app.put("/api/admin/cars/{car_id}")
async def update_car(car_id: str, car: CarModel):
    try:
        result = await db.cars.update_one(
            {"_id": ObjectId(car_id)}, 
            {"$set": car.dict()}
        )
        if result.modified_count == 1:
            return {"success": True, "message": "Car updated successfully!"}
        raise HTTPException(status_code=404, detail="Car not found or no changes made")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid car ID format")

@app.delete("/api/admin/cars/{car_id}")
async def delete_car(car_id: str):
    try:
        result = await db.cars.delete_one({"_id": ObjectId(car_id)})
        if result.deleted_count == 1:
            return {"success": True, "message": "Car deleted successfully!"}
        raise HTTPException(status_code=404, detail="Car not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid car ID format")

# Bike APIs
@app.post("/api/admin/bikes")
async def add_bike(bike: BikeModel):
    bike_data = bike.dict()
    result = await db.bikes.insert_one(bike_data)
    
    return {
        "success": True,
        "message": "Bike added successfully!",
        "bike_id": str(result.inserted_id)
    }

@app.get("/api/admin/bikes")
async def get_bikes():
    bikes = await db.bikes.find({}, {"_id": 0}).to_list(length=100)
    return {"success": True, "bikes": bikes}

@app.put("/api/admin/bikes/{bike_id}")
async def update_bike(bike_id: str, bike: BikeModel):
    try:
        result = await db.bikes.update_one(
            {"_id": ObjectId(bike_id)}, 
            {"$set": bike.dict()}
        )
        if result.modified_count == 1:
            return {"success": True, "message": "Bike updated successfully!"}
        raise HTTPException(status_code=404, detail="Bike not found or no changes made")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid bike ID format")

@app.delete("/api/admin/bikes/{bike_id}")
async def delete_bike(bike_id: str):
    try:
        result = await db.bikes.delete_one({"_id": ObjectId(bike_id)})
        if result.deleted_count == 1:
            return {"success": True, "message": "Bike deleted successfully!"}
        raise HTTPException(status_code=404, detail="Bike not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid bike ID format")

# User and Booking APIs
@app.get("/api/admin/users")
async def get_users():
    users = await db.users.find({}, {"_id": 0}).to_list(length=100)
    return {"success": True, "users": users}

@app.get("/api/admin/bookings")
async def get_bookings():
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(length=100)
    return {"success": True, "bookings": bookings} 