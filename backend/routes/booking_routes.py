<<<<<<< HEAD
"""
Booking routes — book a slot, list bookings, complete/exit, cancel.
"""
from flask import Blueprint, request, jsonify, g

from services.booking_service import (
    book_slot,
    exit_parking,
    cancel,
    user_bookings,
    all_bookings,
    booking_detail,
)
from models.vehicle_model import get_vehicles_by_user, add_vehicle
from database import get_db
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from utils.auth_utils import token_required, admin_required

booking_bp = Blueprint("bookings", __name__, url_prefix="/api")


# ── Create a booking ─────────────────────────────────────────────────────────

@booking_bp.route("/bookings", methods=["POST"])
@token_required
def create_booking():
    """POST /api/bookings   (also served as /api/book-slot below)
    Body: { vehicleId, slotId, amount? }
    """
    data = request.get_json(silent=True) or {}
    vehicle_id = data.get("vehicleId", "")
    vehicle_number = data.get("vehicleNumber", "")
    slot_id = data.get("slotId", "")
    amount = data.get("amount")

    if not slot_id or (not vehicle_id and not vehicle_number):
        return jsonify({"message": "slotId and either vehicleId or vehicleNumber are required"}), 400

    # Auto-resolve vehicleNumber to vehicleId
    if not vehicle_id and vehicle_number:
        # Check if user already has this vehicle
        user_vehicles = get_vehicles_by_user(g.user_id)
        found = False
        for v in user_vehicles:
            if v.get("vehicleNumber", "").upper() == vehicle_number.upper():
                vehicle_id = str(v["_id"])
                found = True
                break
        
        # If not found, implicitly create it
        if not found:
            try:
                new_v = add_vehicle(g.user_id, vehicle_number, "car")
                vehicle_id = str(new_v["_id"])
            except DuplicateKeyError:
                pass # Unlikely, but fallback if needed

    booking, error = book_slot(g.user_id, vehicle_id, slot_id, amount=amount)
    if error:
        return jsonify({"message": error}), 400
    return jsonify({"message": "Slot booked successfully", "booking": booking}), 201


@booking_bp.route("/book-slot", methods=["POST"])
@token_required
def book_slot_alias():
    """POST /api/book-slot — alias kept for backwards compatibility."""
    return create_booking()


# ── List bookings ─────────────────────────────────────────────────────────────

@booking_bp.route("/bookings", methods=["GET"])
@token_required
def list_my_bookings():
    """GET /api/bookings — returns bookings for the authenticated user."""
    bookings = user_bookings(g.user_id)
    return jsonify({"bookings": bookings}), 200


@booking_bp.route("/bookings/all", methods=["GET"])
@admin_required
def list_all_bookings():
    """GET /api/bookings/all — admin: returns every booking with basic user/vehicle info."""
    db = get_db()
    enriched: list[dict] = []

    for b in db.bookings.find().sort("entryTime", -1):
        booking = {
            "_id": str(b.get("_id")),
            "slotId": b.get("slotId"),
            "status": b.get("status"),
            "entryTime": b.get("entryTime"),
            "exitTime": b.get("exitTime"),
            "userId": b.get("userId"),
            "vehicleId": b.get("vehicleId"),
        }

        # Attach user name & email if available
        user_id = b.get("userId")
        try:
            user_doc = db.users.find_one({"_id": ObjectId(user_id)}) if user_id else None
        except Exception:
            user_doc = None
        if user_doc:
            booking["userName"] = user_doc.get("name")
            booking["userEmail"] = user_doc.get("email")

        # Attach vehicle number if available
        vehicle_id = b.get("vehicleId")
        try:
            vehicle_doc = db.vehicles.find_one({"_id": ObjectId(vehicle_id)}) if vehicle_id else None
        except Exception:
            vehicle_doc = None
        if vehicle_doc:
            booking["vehicleNumber"] = vehicle_doc.get("vehicleNumber")

        enriched.append(booking)

    return jsonify({"bookings": enriched}), 200


@booking_bp.route("/bookings/<user_id>", methods=["GET"])
@token_required
def list_user_bookings(user_id):
    """GET /api/bookings/<userId>"""
    bookings = user_bookings(user_id)
    return jsonify({"bookings": bookings}), 200


@booking_bp.route("/bookings/<booking_id>/detail", methods=["GET"])
@token_required
def get_booking(booking_id):
    """GET /api/bookings/<bookingId>/detail"""
    booking = booking_detail(booking_id)
    if booking is None:
        return jsonify({"message": "Booking not found"}), 404
    return jsonify({"booking": booking}), 200


# ── Exit / complete a booking ─────────────────────────────────────────────────

@booking_bp.route("/exit/<booking_id>", methods=["PUT"])
@token_required
def exit_booking(booking_id):
    """PUT /api/exit/<bookingId>"""
    booking, error = exit_parking(booking_id)
    if error:
        return jsonify({"message": error}), 400
    return jsonify({"message": "Parking exited successfully", "booking": booking}), 200


# ── Cancel a booking ──────────────────────────────────────────────────────────

@booking_bp.route("/bookings/<booking_id>", methods=["DELETE"])
@token_required
def cancel_booking(booking_id):
    """DELETE /api/bookings/<bookingId>"""
    booking, error = cancel(booking_id)
    if error:
        return jsonify({"message": error}), 400
    return jsonify({"message": "Booking cancelled", "booking": booking}), 200
=======
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
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
