from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from models.user_model import create_user, get_user_by_email, update_user_password
import random

auth_bp = Blueprint("auth", __name__)

# Temporary OTP storage
otp_store = {}


# ───────────────── REGISTER / SIGNUP ─────────────────
@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = get_user_by_email(email)
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    try:
        user_id = create_user(name, email, password)

        return jsonify({
            "message": "Account created successfully",
            "user": {
                "_id": user_id,
                "name": name,
                "email": email,
                "role": "user"
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/signup", methods=["POST"])
def signup():
    return register()


# ───────────────── LOGIN ─────────────────
@auth_bp.route("/auth/login", methods=["POST"])
def login():
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
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user"),
        }
    }), 200


@auth_bp.route("/login", methods=["POST"])
def login_legacy():
    return login()


# ───────────────── FORGOT PASSWORD (SEND OTP) ─────────────────
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = get_user_by_email(email)

    if not user:
        return jsonify({"error": "No account found with this email"}), 404

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    try:
        msg = Message(
            subject="ParkEasy Password Reset OTP",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[email]
        )

        msg.body = f"""
Hello,

Your OTP for resetting your ParkEasy password is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this password reset, please ignore this email.

Regards,
ParkEasy Team
"""

        mail = current_app.extensions["mail"]
        mail.send(msg)

        # Also print OTP for testing
        print(f"OTP sent to {email}: {otp}")

    except Exception as e:
        print("Email sending error:", e)
        return jsonify({"error": "Failed to send OTP email"}), 500

    return jsonify({
        "message": "OTP sent to email",
        "email": email
    }), 200


# ───────────────── VERIFY OTP ─────────────────
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "")

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    stored_otp = otp_store.get(email)

    if stored_otp != otp:
        return jsonify({"error": "Invalid OTP"}), 401

    return jsonify({"message": "OTP verified"}), 200


# ───────────────── RESET PASSWORD ─────────────────
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    new_password = data.get("newPassword", "")

    if not email or not new_password:
        return jsonify({"error": "Email and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    update_user_password(email, new_password)

    # remove OTP after reset
    otp_store.pop(email, None)

    return jsonify({
        "message": "Password updated successfully"
    }), 200