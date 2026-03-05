from flask import Blueprint, request, jsonify
from models.user_model import create_user, get_user_by_email, update_user_password

auth_bp = Blueprint("auth", __name__)


# ──────────────── REGISTER / SIGNUP ────────────────
@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Body: { "name": "...", "email": "...", "password": "..." }
    """
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    # Check if user already exists
    existing = get_user_by_email(email)
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    try:
        user_id = create_user(name, email, password)
        return jsonify({
            "message": "Account created successfully",
            "user": {"_id": user_id, "name": name, "email": email},
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Legacy endpoint kept for backward compatibility
@auth_bp.route("/signup", methods=["POST"])
def signup():
    return register()


# ──────────────── LOGIN ────────────────
@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Body: { "email": "...", "password": "..." }
    """
    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({"error": "No account found with this email"}), 404

    if user["password"] != password:
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "_id": user["_id"],
            "name": user["name"],
            "email": user["email"],
        },
    }), 200


# Legacy endpoint kept for backward compatibility
@auth_bp.route("/login", methods=["POST"])
def login_legacy():
    return login()


# ──────────────── FORGOT PASSWORD ────────────────
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """
    POST /api/forgot-password
    Body: { "email": "...", "newPassword": "..." (optional) }
    """
    data = request.get_json()

    email = data.get("email", "").strip().lower()
    new_password = data.get("newPassword", "")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({"error": "No account found with this email"}), 404

    if new_password:
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        update_user_password(email, new_password)
        return jsonify({"message": "Password updated successfully"}), 200

    # If no new password provided, just verify the email exists (step 1)
    return jsonify({"message": "Email verified", "email": email}), 200
