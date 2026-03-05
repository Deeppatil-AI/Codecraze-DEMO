"""
Admin routes — analytics & management endpoints for the dashboard.
"""
from flask import Blueprint, jsonify

from database import get_db
from utils.auth_utils import admin_required


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/summary", methods=["GET"])
@admin_required
def summary():
    """
    GET /api/admin/summary

    Returns high-level metrics for the admin dashboard:
    - totalUsers
    - totalBookings / active / completed / cancelled
    - totalRevenue (sum of successful payments)
    """
    db = get_db()

    total_users = db.users.count_documents({})
    total_bookings = db.bookings.count_documents({})
    active_bookings = db.bookings.count_documents({"status": "active"})
    completed_bookings = db.bookings.count_documents({"status": "completed"})
    cancelled_bookings = db.bookings.count_documents({"status": "cancelled"})

    # Revenue: sum of booking.amount for all non-cancelled bookings
    total_revenue = 0.0
    for b in db.bookings.find(
        {"status": {"$ne": "cancelled"}, "amount": {"$exists": True}}
    ):
        try:
            total_revenue += float(b.get("amount", 0) or 0)
        except (TypeError, ValueError):
            continue

    return jsonify(
        {
            "totalUsers": total_users,
            "totalBookings": total_bookings,
            "activeBookings": active_bookings,
            "completedBookings": completed_bookings,
            "cancelledBookings": cancelled_bookings,
            "totalRevenue": total_revenue,
        }
    ), 200


@admin_bp.route("/payments", methods=["GET"])
@admin_required
def list_payments():
    """
    GET /api/admin/payments

    Return all recorded payments (for reporting).
    """
    db = get_db()
    payments = []
    for p in db.payments.find().sort("createdAt", -1):
        p["_id"] = str(p["_id"])
        payments.append(p)

    return jsonify({"payments": payments}), 200

