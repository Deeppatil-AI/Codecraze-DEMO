from flask import Blueprint, request, jsonify
from config.db import db

contact_bp = Blueprint("contact", __name__)

contacts_collection = db["contacts"]


# ──────────────── SEND CONTACT MESSAGE ────────────────
@contact_bp.route("/contact", methods=["POST"])
def send_contact():
    """
    POST /api/contact
    Body: { "name": "...", "email": "...", "message": "..." }
    """
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required"}), 400

    try:
        import time

        contact_entry = {
            "name": name,
            "email": email,
            "message": message,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        contacts_collection.insert_one(contact_entry)

        return jsonify({"message": "Message sent successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
