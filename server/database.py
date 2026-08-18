from motor.motor_asyncio import AsyncIOMotorClient

# Local MongoDB connection URL
MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL)
db = client["rental_car_db"] 