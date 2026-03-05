from flask import Blueprint, request, jsonify
from config.db import users_collection, bookings_collection, slots_collection

admin_bp = Blueprint("admin", __name__)


# ──────────────── GET ALL USERS ────────────────
@admin_bp.route("/admin/users", methods=["GET"])
def list_users():
    """
    GET /api/admin/users
    Returns all registered users with their booking count and total spent.
    """
    search = request.args.get("q", "").strip().lower()

    query = {}
    if search:
        import re
        pattern = re.compile(search, re.IGNORECASE)
        query = {"$or": [{"name": pattern}, {"email": pattern}]}

    users = list(users_collection.find(query, {"password": 0}).sort("_id", -1))

    # Enrich each user with booking stats
    for u in users:
        u["_id"] = str(u["_id"])
        uid = u["_id"]
        user_bookings = list(bookings_collection.find({"user_id": uid}))
        u["bookings"] = len(user_bookings)
        u["spent"] = sum(b.get("total", 0) for b in user_bookings)
        u["status"] = u.get("status", "active")
        u["joined"] = u.get("created_at", "")[:10] if u.get("created_at") else ""

    return jsonify({"users": users, "total": len(users)}), 200


# ──────────────── GET ADMIN OVERVIEW STATS ────────────────
@admin_bp.route("/admin/stats", methods=["GET"])
def admin_stats():
    """
    GET /api/admin/stats
    Returns aggregate stats: revenue, bookings breakdown, slot counts, top locations.
    """
    all_bookings = list(bookings_collection.find())
    for b in all_bookings:
        b["_id"] = str(b["_id"])

    total_revenue   = sum(b.get("total", 0) for b in all_bookings)
    total_bookings  = len(all_bookings)
    active_count    = sum(1 for b in all_bookings if b.get("status") in ("active", "confirmed"))
    completed_count = sum(1 for b in all_bookings if b.get("status") in ("completed", "paid"))
    cancelled_count = sum(1 for b in all_bookings if b.get("status") == "cancelled")

    # Slot counts from DB
    total_slots     = slots_collection.count_documents({})
    available_slots = slots_collection.count_documents({"status": "available"})
    occupied_slots  = slots_collection.count_documents({"status": "occupied"})

    # Top locations by revenue
    location_rev = {}
    for b in all_bookings:
        loc = b.get("location", "Unknown")
        location_rev[loc] = location_rev.get(loc, 0) + b.get("total", 0)

    top_locations = sorted(
        [{"name": k, "revenue": v} for k, v in location_rev.items()],
        key=lambda x: x["revenue"],
        reverse=True,
    )[:5]

    # Monthly revenue for sparkline (last 6 months)
    from datetime import datetime
    now = datetime.utcnow()
    monthly = []
    for i in range(5, -1, -1):
        # Go back i months correctly using year/month arithmetic
        month = now.month - i
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        label = datetime(year, month, 1).strftime("%b")
        month_key = f"{year}-{month:02d}"
        rev = sum(
            b.get("total", 0)
            for b in all_bookings
            if b.get("created_at", "")[:7] == month_key
        )
        monthly.append({"label": label, "value": rev})

    # Registered users count
    total_users = users_collection.count_documents({})

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


# ──────────────── RESET ALL SLOTS TO AVAILABLE ────────────────
@admin_bp.route("/admin/slots/reset", methods=["POST"])
def reset_all_slots():
    """
    POST /api/admin/slots/reset
    Resets every parking slot in the DB back to 'available'.
    """
    result = slots_collection.update_many({}, {"$set": {"status": "available"}})
    return jsonify({
        "message": "All slots reset to available",
        "modified": result.modified_count,
        "total": slots_collection.count_documents({}),
    }), 200

