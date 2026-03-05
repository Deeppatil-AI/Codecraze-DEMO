"""
Floor routes — list and create parking floors (admin).
"""
from flask import Blueprint, request, jsonify
from pymongo.errors import DuplicateKeyError

from models.floor_model import create_floor, get_all_floors
from utils.auth_utils import admin_required

floor_bp = Blueprint("floors", __name__, url_prefix="/api/floors")


@floor_bp.route("", methods=["GET"])
def list_floors():
    """GET /api/floors"""
    floors = get_all_floors()
    return jsonify({"floors": floors}), 200


@floor_bp.route("", methods=["POST"])
@admin_required
def add_floor():
    """POST /api/floors
    Body: { floorNumber, totalSlots }
    """
    data = request.get_json(silent=True) or {}
    floor_number = data.get("floorNumber")
    total_slots = data.get("totalSlots")

    if floor_number is None or total_slots is None:
        return jsonify({"message": "floorNumber and totalSlots are required"}), 400

    try:
        floor = create_floor(int(floor_number), int(total_slots))
    except DuplicateKeyError:
        return jsonify({"message": f"Floor {floor_number} already exists"}), 409

    return jsonify({"message": "Floor created", "floor": floor}), 201
