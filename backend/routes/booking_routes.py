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
