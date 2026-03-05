from flask import Blueprint, request, jsonify
from models.booking_model import (
    create_booking,
    get_bookings_by_user,
    get_bookings_by_user_email,
    get_all_bookings,
    get_booking_by_id,
    cancel_booking_by_id,
)

booking_bp = Blueprint("bookings", __name__)


# ──────────────── CREATE BOOKING ────────────────
@booking_bp.route("/bookings", methods=["POST"])
def book_slot():
    """
    POST /api/bookings
    Body: { "user_id", "slot_id", "full_name", "vehicle" / "vehicle_number",
            "location", "floor", "date", "time", "duration", "total" }
    """
    data = request.get_json()

    slot_id = data.get("slot_id", "")
    full_name = data.get("full_name", "").strip()
    vehicle = data.get("vehicle", data.get("vehicle_number", "")).strip()
    location = data.get("location", "").strip()
    floor = data.get("floor", "Floor 1").strip()
    date = data.get("date", "").strip()
    time = data.get("time", "").strip()
    duration = data.get("duration", 1)
    total = data.get("total", 0)
    user_id = data.get("user_id", "")           # optional (guest bookings allowed)
    user_email = data.get("user_email", "")     # for reliable dashboard lookup

    if not slot_id or not full_name or not vehicle or not date or not time or not location:
        return jsonify({"error": "Missing required booking fields"}), 400

    try:
        booking_id = create_booking(
            user_id=user_id,
            slot_id=slot_id,
            full_name=full_name,
            vehicle=vehicle,
            location=location,
            floor=floor,
            date=date,
            time=time,
            duration=float(duration),
            total=float(total),
            user_email=user_email,
        )
        return jsonify({
            "message": "Booking confirmed!",
            "booking_id": booking_id,
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Legacy endpoint kept for backward compatibility
@booking_bp.route("/book", methods=["POST"])
def book_slot_legacy():
    return book_slot()


# ──────────────── GET USER BOOKINGS ────────────────
@booking_bp.route("/bookings", methods=["GET"])
def list_bookings():
    """
    GET /api/bookings?user_id=...&user_email=...
    Returns bookings for a specific user (by id OR email, merged & deduped).
    Falls back to all bookings if neither param is provided.
    """
    user_id    = request.args.get("user_id", "").strip()
    user_email = request.args.get("user_email", "").strip().lower()

    if user_id or user_email:
        # Collect from both sources and deduplicate by _id
        seen = set()
        bookings = []
        if user_id:
            for b in get_bookings_by_user(user_id):
                if b["_id"] not in seen:
                    seen.add(b["_id"])
                    bookings.append(b)
        if user_email:
            for b in get_bookings_by_user_email(user_email):
                if b["_id"] not in seen:
                    seen.add(b["_id"])
                    bookings.append(b)
        # Sort merged list by created_at descending
        bookings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    else:
        bookings = get_all_bookings()

    return jsonify({"bookings": bookings, "total": len(bookings)}), 200


# ──────────────── GET SINGLE BOOKING ────────────────
@booking_bp.route("/bookings/<booking_id>", methods=["GET"])
def get_booking(booking_id):
    booking = get_booking_by_id(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(booking), 200


# ──────────────── CANCEL BOOKING ────────────────
@booking_bp.route("/bookings/<booking_id>", methods=["DELETE"])
def cancel_booking(booking_id):
    """
    DELETE /api/bookings/<booking_id>
    Cancels a booking and frees up the associated slot.
    """
    result = cancel_booking_by_id(booking_id)
    if not result:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify({"message": "Booking cancelled successfully"}), 200
