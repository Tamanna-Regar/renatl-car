from fastapi import APIRouter
from database import db
import re

router = APIRouter()


def parse_amount(value):
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = re.sub(r"[^0-9.-]", "", str(value or ""))
    try:
        return float(cleaned or 0)
    except ValueError:
        return 0.0


@router.get("/api/dashboard-stats")
async def get_dashboard_stats():
    total_vehicles = await db.vehicles.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_users = await db.users.count_documents({})

    active_rentals = await db.bookings.count_documents({
        "status": {"$in": ["active", "confirmed", "payment received", "Payment Received"]}
    })

    pending_requests = await db.bookings.count_documents({
        "status": {"$in": ["pending", "Pending Payment", "Pending"]}
    })

    overdue_returns = await db.bookings.count_documents({
        "status": {"$in": ["overdue", "Overdue"]}
    })

    cancelled_bookings = await db.bookings.count_documents({
        "status": {"$in": ["cancelled", "Cancelled"]}
    })

    completed_bookings = await db.bookings.count_documents({
        "status": {"$in": ["completed", "Completed"]}
    })

    extensions_used = await db.bookings.count_documents({
        "extended": True
    })

    booking_cursor = db.bookings.find({})
    bookings = await booking_cursor.to_list(length=500)

    revenue_total = 0.0
    monthly_revenue = {
        "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0,
        "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0
    }
    vehicle_revenue = {}
    status_breakdown = {
        "Pending": 0,
        "Pending Payment": 0,
        "Payment Received": 0,
        "Confirmed": 0,
        "Active": 0,
        "Completed": 0,
        "Cancelled": 0,
        "Overdue": 0,
        "Rejected": 0,
    }

    for booking in bookings:
        status = str(booking.get("status") or booking.get("bookingStatus") or "Pending")
        status_breakdown[status] = status_breakdown.get(status, 0) + 1

        total_price = parse_amount(
            booking.get("total_price")
            or booking.get("totalPrice")
            or booking.get("totalAmount")
            or 0
        )
        revenue_total += total_price

        start_date = booking.get("start_date") or booking.get("startDate")
        if start_date:
            try:
                from datetime import datetime
                month_index = datetime.strptime(str(start_date), "%Y-%m-%d").month - 1
                month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                month_key = month_names[month_index]
                monthly_revenue[month_key] += total_price
            except Exception:
                pass

        vehicle_name = booking.get("vehicle_name") or booking.get("vehicleName") or "Unknown"
        vehicle_revenue[vehicle_name] = vehicle_revenue.get(vehicle_name, 0) + total_price

    top_vehicles = [
        {"name": name, "revenue": round(value, 2), "bookings": sum(1 for booking in bookings if (booking.get("vehicle_name") or booking.get("vehicleName") or "Unknown") == name)}
        for name, value in sorted(vehicle_revenue.items(), key=lambda item: item[1], reverse=True)[:5]
    ]

    if total_vehicles > 0:
        utilization = (active_rentals / total_vehicles) * 100
        utilization_rate = f"{utilization:.2f}%"
    else:
        utilization_rate = "0.00%"

    return {
        "totalVehicles": total_vehicles,
        "activeRentals": active_rentals,
        "pendingRequests": pending_requests,
        "overdueReturns": overdue_returns,
        "cancelledBookings": cancelled_bookings,
        "completedBookings": completed_bookings,
        "utilizationRate": utilization_rate,
        "extensionsUsed": extensions_used,
        "totalBookings": total_bookings,
        "totalUsers": total_users,
        "revenueTotal": round(revenue_total, 2),
        "monthlyRevenue": [
            {"name": key, "revenue": round(value, 2)}
            for key, value in monthly_revenue.items()
        ],
        "statusBreakdown": status_breakdown,
        "topVehicles": top_vehicles,
    }