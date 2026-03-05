"""
Admin routes — analytics & management endpoints for the dashboard.
"""
from flask import Blueprint, jsonify, request
import time
from datetime import datetime
from bson import ObjectId

from database import get_db
from utils.auth_utils import admin_required


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# =====================================================================
# HEAD Branch Endpoints (Used by standard admin panel)
# =====================================================================

@admin_bp.route("/summary", methods=["GET"])
@admin_required
def summary():
    """
    GET /api/admin/summary
    Returns high-level metrics for the admin dashboard.
    """
    db = get_db()
    total_users = db.users.count_documents({})
    total_bookings = db.bookings.count_documents({})
    active_bookings = db.bookings.count_documents({"status": "active"})
    completed_bookings = db.bookings.count_documents({"status": "completed"})
    cancelled_bookings = db.bookings.count_documents({"status": "cancelled"})

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
    Return all recorded payments.
    """
    db = get_db()
    payments = []
    for p in db.payments.find().sort("createdAt", -1):
        p["_id"] = str(p["_id"])
        payments.append(p)

    return jsonify({"payments": payments}), 200


# =====================================================================
# Conflicting Branch Endpoints (Used by new SaaS Admin Dashboard)
# =====================================================================

@admin_bp.route("/users", methods=["GET"])
def list_users():
    """
    GET /api/admin/users
    Returns all registered users with their booking count and total spent.
    """
    db = get_db()
    search = request.args.get("q", "").strip().lower()

    query = {}
    if search:
        import re
        pattern = re.compile(search, re.IGNORECASE)
        query = {"$or": [{"name": pattern}, {"email": pattern}]}

    users = list(db.users.find(query, {"password": 0}).sort("_id", -1))

    for u in users:
        u["_id"] = str(u["_id"])
        uid = str(u.get("_id"))
        
        # Depending on how bookings save user format
        user_bookings = list(db.bookings.find({"$or": [{"userId": uid}, {"user_id": uid}]}))
        u["bookings"] = len(user_bookings)
        u["spent"] = sum(b.get("total", b.get("amount", 0)) for b in user_bookings)
        u["status"] = u.get("status", "active")
        u["joined"] = u.get("created_at", "")[:10] if u.get("created_at") else ""

    return jsonify({"users": users, "total": len(users)}), 200


@admin_bp.route("/stats", methods=["GET"])
def admin_stats():
    """
    GET /api/admin/stats
    Returns aggregate stats: revenue, bookings breakdown, slot counts, top locations.
    """
    db = get_db()
    all_bookings = list(db.bookings.find())
    for b in all_bookings:
        b["_id"] = str(b["_id"])

    total_revenue   = sum(b.get("total", b.get("amount", 0)) for b in all_bookings)
    total_bookings  = len(all_bookings)
    active_count    = sum(1 for b in all_bookings if b.get("status") in ("active", "confirmed"))
    completed_count = sum(1 for b in all_bookings if b.get("status") in ("completed", "paid"))
    cancelled_count = sum(1 for b in all_bookings if b.get("status") == "cancelled")

    total_slots     = db.slots.count_documents({})
    available_slots = db.slots.count_documents({"status": "available"})
    occupied_slots  = db.slots.count_documents({"status": "occupied"})

    location_rev = {}
    for b in all_bookings:
        loc = b.get("location", "Unknown")
        location_rev[loc] = location_rev.get(loc, 0) + b.get("total", b.get("amount", 0))

    top_locations = sorted(
        [{"name": k, "revenue": v} for k, v in location_rev.items()],
        key=lambda x: x["revenue"],
        reverse=True,
    )[:5]

    now = datetime.utcnow()
    monthly = []
    for i in range(5, -1, -1):
        month = now.month - i
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        label = datetime(year, month, 1).strftime("%b")
        month_key = f"{year}-{month:02d}"
        
        # sum logic handles both formats
        rev = 0
        for b in all_bookings:
            date_str = b.get("created_at", b.get("createdAt", ""))
            
            if isinstance(date_str, datetime):
                # if it's stored as ISODate in mongo
                if date_str.strftime("%Y-%m") == month_key:
                    rev += b.get("total", b.get("amount", 0))
            elif isinstance(date_str, str) and date_str[:7] == month_key:
                rev += b.get("total", b.get("amount", 0))
                
        monthly.append({"label": label, "value": rev})

    total_users = db.users.count_documents({})

    return jsonify({
        "total_revenue":    total_revenue,
        "total_bookings":   total_bookings,
        "active_count":     active_count,
        "completed_count":  completed_count,
        "cancelled_count":  cancelled_count,
        "total_slots":      total_slots,
        "available_slots":  available_slots,
        "occupied_slots":   occupied_slots,
        "top_locations":    top_locations,
        "monthly_revenue":  monthly,
        "total_users":      total_users,
    }), 200


@admin_bp.route("/slots/reset", methods=["POST"])
def reset_all_slots():
    """
    POST /api/admin/slots/reset
    Resets every parking slot in the DB back to 'available'.
    """
    db = get_db()
    result = db.slots.update_many({}, {"$set": {"status": "available"}})
    return jsonify({
        "message": "All slots reset to available",
        "modified": result.modified_count,
        "total": db.slots.count_documents({}),
    }), 200
