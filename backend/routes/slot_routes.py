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
