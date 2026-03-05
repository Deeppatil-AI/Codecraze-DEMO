"""
JWT authentication utilities.
- create_token:  generate a signed JWT for a user
- decode_token:  verify and decode a JWT
- token_required: decorator to protect routes
"""
import functools
from datetime import datetime, timedelta, timezone

import jwt
from flask import request, jsonify, g
from bson import ObjectId

from settings import Config


def create_token(user_id: str, role: str = "customer") -> str:
    """Return a signed JWT containing user_id and role."""
    payload = {
        "user_id": str(user_id),
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    """Decode a JWT and return the payload, or None on failure."""
    try:
        return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def token_required(f):
    """Decorator that enforces a valid Bearer token on the request."""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Missing or invalid token"}), 401

        payload = decode_token(auth_header.split(" ", 1)[1])
        if payload is None:
            return jsonify({"message": "Token expired or invalid"}), 401

        # Attach user info to Flask's request-scoped `g`
        g.user_id = payload["user_id"]
        g.user_role = payload.get("role", "customer")
        return f(*args, **kwargs)

    return wrapper


def admin_required(f):
    """Decorator that enforces the authenticated user is an admin."""
    @functools.wraps(f)
    @token_required
    def wrapper(*args, **kwargs):
        if g.user_role != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return f(*args, **kwargs)
    return wrapper
