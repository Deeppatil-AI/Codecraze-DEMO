from flask import Blueprint, request, jsonify
from models.slot_model import get_all_slots, get_slot_by_id, get_locations, get_floors

slot_bp = Blueprint("slots", __name__)


# ──────────────── GET ALL SLOTS ────────────────
@slot_bp.route("/slots", methods=["GET"])
def list_slots():
    """
    GET /api/slots?location=Downtown+Parking+Hub&floor=Floor+1
    Returns all slots, optionally filtered by location and floor.
    """
    location = request.args.get("location")
    floor = request.args.get("floor")

    slots = get_all_slots(location=location, floor=floor)

    return jsonify({
        "slots": slots,
        "total": len(slots),
        "available": sum(1 for s in slots if s["status"] == "available"),
        "occupied": sum(1 for s in slots if s["status"] == "occupied"),
    }), 200


# ──────────────── GET SINGLE SLOT ────────────────
@slot_bp.route("/slots/<slot_id>", methods=["GET"])
def get_slot(slot_id):
    slot = get_slot_by_id(slot_id)
    if not slot:
        return jsonify({"error": "Slot not found"}), 404
    return jsonify(slot), 200


# ──────────────── CHECK AVAILABILITY ────────────────
@slot_bp.route("/slots/check", methods=["POST"])
def check_availability():
    """
    POST /api/slots/check
    Body: { "location": "...", "floor": "...", "date": "...", "time": "..." }
    Returns available slots for the given criteria.
    """
    data = request.get_json()

    location = data.get("location", "")
    floor = data.get("floor", "")
    # date and time are accepted but not used for filtering yet (all slots are real-time)

    slots = get_all_slots(location=location if location else None,
                          floor=floor if floor else None)

    available_slots = [s for s in slots if s["status"] == "available"]

    return jsonify({
        "slots": available_slots,
        "total": len(available_slots),
    }), 200


# ──────────────── GET LOCATIONS ────────────────
@slot_bp.route("/locations", methods=["GET"])
def list_locations():
    """Return all distinct parking locations."""
    locations = get_locations()
    return jsonify({"locations": locations}), 200


# ──────────────── GET FLOORS ────────────────
@slot_bp.route("/floors", methods=["GET"])
def list_floors():
    """Return all distinct floors, optionally filtered by location."""
    location = request.args.get("location")
    floors = get_floors(location=location)
    return jsonify({"floors": floors}), 200
