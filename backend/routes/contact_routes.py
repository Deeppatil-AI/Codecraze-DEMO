<<<<<<< HEAD
"""
Contact routes — receives messages from the frontend's contact form.
"""
from flask import Blueprint, request, jsonify

from database import get_db
from utils.helpers import utcnow, serialize_doc

contact_bp = Blueprint("contact", __name__, url_prefix="/api/contact")


@contact_bp.route("", methods=["POST"])
def send_message():
    """POST /api/contact
    Body: { name, email, subject, message }
    """
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not all([name, email, message]):
        return jsonify({"message": "Name, email and message are required"}), 400

    db = get_db()
    contact = {
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
        "createdAt": utcnow(),
    }
    db.contacts.insert_one(contact)

    return jsonify({"message": "Message received! We'll get back to you soon."}), 201
=======
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
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
