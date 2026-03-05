"""
User routes — profile & admin user listing.
"""
from flask import Blueprint, jsonify, g

from models.user_model import find_by_id, get_all_users
from utils.auth_utils import token_required, admin_required

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


@user_bp.route("", methods=["GET"])
@admin_required
def list_users():
    """GET /api/users  (admin only)"""
    users = get_all_users()
    return jsonify({"users": users}), 200


@user_bp.route("/<user_id>", methods=["GET"])
@token_required
def get_user(user_id):
    """GET /api/users/<id>"""
    user = find_by_id(user_id)
    if user is None:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"user": user}), 200


@user_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    """GET /api/users/me — return the currently authenticated user."""
    user = find_by_id(g.user_id)
    if user is None:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"user": user}), 200
