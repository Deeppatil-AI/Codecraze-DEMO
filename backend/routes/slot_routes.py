<<<<<<< HEAD
"""
Slot routes — list, filter, check availability, and update status.
"""
from flask import Blueprint, request, jsonify

from models.slot_model import get_slot_by_slot_id, get_slot_by_object_id
from services.slot_service import list_slots, list_available, occupy_slot, release_slot, is_available
from utils.auth_utils import token_required, admin_required

slot_bp = Blueprint("slots", __name__, url_prefix="/api/slots")


@slot_bp.route("", methods=["GET"])
def get_all():
    """GET /api/slots?floor=1&status=available"""
    filters = {}
    if request.args.get("floor"):
        filters["floor"] = request.args["floor"]
    if request.args.get("status"):
        filters["status"] = request.args["status"]
    slots = list_slots(filters if filters else None)
    return jsonify({"slots": slots}), 200


@slot_bp.route("/available", methods=["GET"])
def get_available():
    """GET /api/slots/available"""
    slots = list_available()
    return jsonify({"slots": slots}), 200


@slot_bp.route("/<slot_id>", methods=["GET"])
def get_one(slot_id):
    """GET /api/slots/<slotId>  — tries slotId first, then ObjectId."""
    slot = get_slot_by_slot_id(slot_id)
    if slot is None:
        slot = get_slot_by_object_id(slot_id)
    if slot is None:
        return jsonify({"message": "Slot not found"}), 404
    return jsonify({"slot": slot}), 200


@slot_bp.route("/check", methods=["POST"])
def check_availability():
    """POST /api/slots/check
    Body: { slotId }  — used by the React frontend's checkAvailability()
    """
    data = request.get_json(silent=True) or {}
    slot_id = data.get("slotId", "")
    if not slot_id:
        return jsonify({"message": "slotId is required"}), 400

    available = is_available(slot_id)
    slot = get_slot_by_slot_id(slot_id)
    return jsonify({"available": available, "slot": slot}), 200


@slot_bp.route("/<slot_id>/status", methods=["PUT"])
@admin_required
def update_status(slot_id):
    """PUT /api/slots/<slotId>/status
    Body: { status: "available" | "occupied" }
    """
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "")
    if new_status not in ("available", "occupied"):
        return jsonify({"message": "Status must be 'available' or 'occupied'"}), 400

    if new_status == "occupied":
        slot = occupy_slot(slot_id)
    else:
        slot = release_slot(slot_id)

    if slot is None:
        return jsonify({"message": "Slot not found"}), 404
    return jsonify({"message": "Status updated", "slot": slot}), 200
=======
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
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
