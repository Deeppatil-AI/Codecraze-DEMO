"""
Vehicle routes — add and list vehicles for a user.
"""
from flask import Blueprint, request, jsonify, g
from pymongo.errors import DuplicateKeyError

from models.vehicle_model import add_vehicle, get_vehicles_by_user, delete_vehicle
from utils.auth_utils import token_required

vehicle_bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")


@vehicle_bp.route("", methods=["POST"])
@token_required
def create_vehicle():
    """POST /api/vehicles
    Body: { vehicleNumber, vehicleType }
    """
    data = request.get_json(silent=True) or {}
    number = data.get("vehicleNumber", "").strip()
    v_type = data.get("vehicleType", "car").strip()

    if not number:
        return jsonify({"message": "Vehicle number is required"}), 400

    try:
        vehicle = add_vehicle(g.user_id, number, v_type)
    except DuplicateKeyError:
        return jsonify({"message": "Vehicle already registered"}), 409

    return jsonify({"message": "Vehicle added", "vehicle": vehicle}), 201


@vehicle_bp.route("", methods=["GET"])
@token_required
def list_vehicles():
    """GET /api/vehicles — vehicles for the authenticated user."""
    vehicles = get_vehicles_by_user(g.user_id)
    return jsonify({"vehicles": vehicles}), 200


@vehicle_bp.route("/<user_id>", methods=["GET"])
@token_required
def list_user_vehicles(user_id):
    """GET /api/vehicles/<userId>"""
    vehicles = get_vehicles_by_user(user_id)
    return jsonify({"vehicles": vehicles}), 200


@vehicle_bp.route("/<vehicle_id>", methods=["DELETE"])
@token_required
def remove_vehicle(vehicle_id):
    """DELETE /api/vehicles/<vehicleId>"""
    deleted = delete_vehicle(vehicle_id)
    if not deleted:
        return jsonify({"message": "Vehicle not found"}), 404
    return jsonify({"message": "Vehicle deleted"}), 200
