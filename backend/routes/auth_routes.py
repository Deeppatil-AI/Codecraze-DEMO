<<<<<<< HEAD
"""
Authentication routes — register & login.
"""
from datetime import timedelta

from flask import Blueprint, request, jsonify
from pymongo.errors import DuplicateKeyError

from database import get_db
from models.user_model import create_user, find_by_email, verify_password, update_password
from utils.auth_utils import create_token
from utils.helpers import utcnow, generate_otp, send_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


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
            {"_id": user["_id"]},
            {
                "$set": {
                    "isVerified": False,
                    "signupOtp": otp,
                    "signupOtpExpiresAt": otp_expires,
                }
            },
        )

    # Send email (or log to console in dev)
    send_email(
        to_email=email,
        subject="Your ParkMate signup verification code",
        body=f"Hi {name or 'there'},\n\nYour ParkMate verification code is: {otp}\n\nThis code is valid for 10 minutes.\n",
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
    if expires and utcnow() > expires:
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
        send_email(
            to_email=email,
            subject="Your ParkMate password reset code",
            body=f"Hi {doc.get('name','there')},\n\nYour ParkMate password reset code is: {otp}\n\nThis code is valid for 10 minutes.\n",
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
    if expires and utcnow() > expires:
        return jsonify({"message": "Code has expired"}), 400
=======
from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from models.user_model import create_user, get_user_by_email, update_user_password
import random

auth_bp = Blueprint("auth", __name__)

# Temporary OTP storage
otp_store = {}


# ───────────────── REGISTER / SIGNUP ─────────────────
@auth_bp.route("/auth/send-signup-otp", methods=["POST"])
def send_signup_otp():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    existing = get_user_by_email(email)
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    try:
        msg = Message(
            subject="ParkMate Registration OTP",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[email]
        )
        msg.body = f"Hello,\n\nYour OTP for ParkMate registration is: {otp}\n\nRegards,\nParkMate Team"
        mail = current_app.extensions["mail"]
        mail.send(msg)
        print(f"Signup OTP sent to {email}: {otp}")
    except Exception as e:
        print("Email sending error:", e)
        return jsonify({"error": "Failed to send OTP email"}), 500

    return jsonify({"message": "OTP sent to email"}), 200


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    otp = data.get("otp", "")

    if not name or not email or not password or not otp:
        return jsonify({"error": "All fields including OTP are required"}), 400

    if otp_store.get(email) != otp:
        return jsonify({"error": "Invalid or expired OTP"}), 401

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = get_user_by_email(email)
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    try:
        user_id = create_user(name, email, password)
        otp_store.pop(email, None)  # Clean up

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
            subject="ParkMate Password Reset OTP",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[email]
        )

        msg.body = f"""
Hello,

Your OTP for resetting your ParkMate password is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this password reset, please ignore this email.

Regards,
ParkMate Team
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
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1

    return jsonify({"message": "OTP verified"}), 200


<<<<<<< HEAD
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
    if expires and utcnow() > expires:
        return jsonify({"message": "Code has expired"}), 400

    update_password(email, new_password)
    db.users.update_one(
        {"_id": doc["_id"]},
        {
            "$unset": {"resetOtp": "", "resetOtpExpiresAt": ""},
        },
    )

    return jsonify({"message": "Password reset successful"}), 200
=======
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
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
