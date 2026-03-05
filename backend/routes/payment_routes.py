"""
Payment routes — placeholder endpoints for future payment integration.

The frontend's api.js calls POST /api/payments and GET /api/payments/:id,
so we provide stub implementations that record payment intent in MongoDB.
"""
from flask import Blueprint, request, jsonify, g
from bson import ObjectId

from database import get_db
from utils.helpers import utcnow, serialize_doc
from utils.auth_utils import token_required

payment_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payment_bp.route("", methods=["POST"])
@token_required
def create_payment():
    """POST /api/payments
    Body: { bookingId, amount, method, upiId? }
    """
    data = request.get_json(silent=True) or {}
    booking_id = data.get("bookingId", "")
    amount = data.get("amount", 0)
    method = data.get("method", "card")
    upi_id = data.get("upiId")

    if not booking_id:
        return jsonify({"message": "bookingId is required"}), 400

    db = get_db()
    payment = {
        "bookingId": booking_id,
        "userId": g.user_id,
        "amount": float(amount),
        "method": method,
        "upiId": upi_id,
        "status": "success",          # stub — always succeeds for now
        "createdAt": utcnow(),
    }
    result = db.payments.insert_one(payment)
    payment["_id"] = result.inserted_id

    return jsonify({
        "message": "Payment processed",
        "payment": serialize_doc(payment),
    }), 201


@payment_bp.route("/<payment_id>", methods=["GET"])
@token_required
def get_payment(payment_id):
    """GET /api/payments/<paymentId>"""
    db = get_db()
    doc = db.payments.find_one({"_id": ObjectId(payment_id)})
    if doc is None:
        return jsonify({"message": "Payment not found"}), 404
    return jsonify({"payment": serialize_doc(doc)}), 200
