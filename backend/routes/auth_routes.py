"""
Authentication routes — register & login.
"""
from datetime import timedelta

from flask import Blueprint, request, jsonify
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

from database import get_db
from models.user_model import create_user, find_by_email, verify_password, update_password
from utils.auth_utils import create_token
from utils.helpers import utcnow, generate_otp
from utils.email_service import EmailService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
email_svc = EmailService()


@auth_bp.route("/register/request-otp", methods=["POST"])
def register_request_otp():
    """Step 1 — request OTP for signup.

    POST /api/auth/register/request-otp
    Body: { name, email, password }
    """
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not all([name, email, password]):
        return jsonify({"message": "Name, email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400

    db = get_db()
    existing = find_by_email(email)
    if existing and existing.get("isVerified", True):
        return jsonify({"message": "Email already registered"}), 409

    # Create or update a provisional user with OTP
    otp = generate_otp()
    otp_expires = utcnow() + timedelta(minutes=10)

    if existing:
        # Update provisional user details
        db.users.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "name": name,
                    "isVerified": False,
                    "signupOtp": otp,
                    "signupOtpExpiresAt": otp_expires,
                }
            },
        )
        update_password(email, password)
    else:
        # Create a new user then attach OTP fields
        user = create_user(name, email, password)
        db.users.update_one(
            {"_id": ObjectId(user["_id"])},
            {
                "$set": {
                    "isVerified": False,
                    "signupOtp": otp,
                    "signupOtpExpiresAt": otp_expires,
                }
            },
        )

    # Send professional HTML email (or log to console in dev/fallback)
    email_svc.send_otp_email_async(
        recipient=email,
        otp=otp,
        recipient_name=name or 'there'
    )

    return jsonify({"message": "OTP sent to email if it exists."}), 200


@auth_bp.route("/register/verify-otp", methods=["POST"])
def register_verify_otp():
    """Step 2 — verify OTP and complete signup.

    POST /api/auth/register/verify-otp
    Body: { email, otp }
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    otp = data.get("otp", "").strip()

    if not all([email, otp]):
        return jsonify({"message": "Email and OTP are required"}), 400

    db = get_db()
    doc = db.users.find_one({"email": email.lower().strip()})
    if not doc:
        return jsonify({"message": "Invalid code or email"}), 400

    if doc.get("signupOtp") != otp:
        return jsonify({"message": "Invalid code"}), 400

    expires = doc.get("signupOtpExpiresAt")
    if expires and utcnow().replace(tzinfo=None) > expires.replace(tzinfo=None):
        return jsonify({"message": "Code has expired"}), 400

    # Mark verified and clear OTP
    db.users.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {"isVerified": True},
            "$unset": {"signupOtp": "", "signupOtpExpiresAt": ""},
        },
    )

    safe_user = {
        "_id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "role": doc.get("role", "customer"),
    }
    token = create_token(str(doc["_id"]), safe_user["role"])

    return jsonify(
        {
            "message": "Signup verified successfully",
            "token": token,
            "user": safe_user,
        }
    ), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    """POST /api/auth/login
    Body: { email, password }
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not all([email, password]):
        return jsonify({"message": "Email and password are required"}), 400

    user = find_by_email(email)
    if user is None or not verify_password(password, user["password"]):
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.get("isVerified", False):
        return jsonify({"message": "Please verify your email with the OTP we sent before logging in."}), 403

    token = create_token(str(user["_id"]), user.get("role", "customer"))
    # Build a safe response (no password)
    safe_user = {
        "_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "customer"),
    }
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": safe_user,
    }), 200


@auth_bp.route("/forgot/request-otp", methods=["POST"])
def forgot_request_otp():
    """Step 1 — request OTP for password reset.

    POST /api/auth/forgot/request-otp
    Body: { email }
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    if not email:
        return jsonify({"message": "Email is required"}), 400

    db = get_db()
    doc = find_by_email(email)
    if doc:
        otp = generate_otp()
        otp_expires = utcnow() + timedelta(minutes=10)
        db.users.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "resetOtp": otp,
                    "resetOtpExpiresAt": otp_expires,
                }
            },
        )
        email_svc.send_otp_email_async(
            recipient=email,
            otp=otp,
            recipient_name=doc.get('name', 'there')
        )

    # Always respond success to avoid leaking which emails exist
    return jsonify({"message": "If this email is registered, a reset code has been sent."}), 200


@auth_bp.route("/forgot/verify-otp", methods=["POST"])
def forgot_verify_otp():
    """Step 2 — verify reset OTP (used by the UI to move to reset step)."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    otp = data.get("otp", "").strip()

    if not all([email, otp]):
        return jsonify({"message": "Email and OTP are required"}), 400

    db = get_db()
    doc = db.users.find_one({"email": email.lower().strip()})
    if not doc or doc.get("resetOtp") != otp:
        return jsonify({"message": "Invalid code"}), 400

    expires = doc.get("resetOtpExpiresAt")
    if expires and utcnow().replace(tzinfo=None) > expires.replace(tzinfo=None):
        return jsonify({"message": "Code has expired"}), 400

    return jsonify({"message": "OTP verified"}), 200


@auth_bp.route("/forgot/reset", methods=["POST"])
def forgot_reset_password():
    """Step 3 — reset password using OTP."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    otp = data.get("otp", "").strip()
    new_password = data.get("password", "")

    if not all([email, otp, new_password]):
        return jsonify({"message": "Email, OTP and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400

    db = get_db()
    doc = db.users.find_one({"email": email.lower().strip()})
    if not doc or doc.get("resetOtp") != otp:
        return jsonify({"message": "Invalid code"}), 400

    expires = doc.get("resetOtpExpiresAt")
    if expires and utcnow().replace(tzinfo=None) > expires.replace(tzinfo=None):
        return jsonify({"message": "Code has expired"}), 400

    update_password(email, new_password)
    db.users.update_one(
        {"_id": doc["_id"]},
        {
            "$unset": {"resetOtp": "", "resetOtpExpiresAt": ""},
        },
    )

    return jsonify({"message": "Password reset successful"}), 200
