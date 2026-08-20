from fastapi import APIRouter
from database import db  

router = APIRouter()

@router.get("/api/dashboard-stats")
async def get_dashboard_stats():
    total_vehicles = await db.vehicles.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_users = await db.users.count_documents({})
    
    active_rentals = await db.bookings.count_documents({"status": "active"})
    pending_requests = await db.bookings.count_documents({"status": "pending"})
    overdue_returns = await db.bookings.count_documents({"status": "overdue"})
    extensions_used = await db.bookings.count_documents({"extended": True})

    return {
        "totalVehicles": total_vehicles,
        "activeRentals": active_rentals,
        "pendingRequests": pending_requests,
        "overdueReturns": overdue_returns,
        "utilizationRate": "53.85%",
        "extensionsUsed": extensions_used,
        "totalBookings": total_bookings,
        "totalUsers": total_users
    }