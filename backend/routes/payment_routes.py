import time
from flask import Blueprint, request, jsonify
from config.db import payments_collection, bookings_collection
from bson import ObjectId

payment_bp = Blueprint("payments", __name__)


# ──────────────── PROCESS PAYMENT ────────────────
@payment_bp.route("/payments", methods=["POST"])
def process_payment():
    """
    POST /api/payments
    Body: { "booking_id": "...", "amount": 100, "method": "card" | "upi" }
    """
    data = request.get_json()

    booking_id = data.get("booking_id", "")
    method = data.get("method", "card")         # card | upi
    amount = data.get("amount", 0)

    if not booking_id or not amount:
        return jsonify({"error": "Booking ID and amount are required"}), 400

    # Generate a unique transaction ID
    txn_id = f"PE-{int(time.time() * 1000)}"

    try:
        # Insert payment record
        payment = {
            "booking_id": booking_id,
            "method": method,
            "amount": int(amount),
            "status": "success",
            "txn_id": txn_id,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        payments_collection.insert_one(payment)

        # Update booking status to 'paid'
        try:
            bookings_collection.update_one(
                {"_id": ObjectId(booking_id)},
                {"$set": {"status": "paid"}},
            )
        except Exception:
            pass  # booking_id may not be a valid ObjectId

        return jsonify({
            "message": "Payment successful",
            "txn_id": txn_id,
            "amount": amount,
            "method": method,
            "status": "success",
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Legacy endpoint kept for backward compatibility
@payment_bp.route("/payment", methods=["POST"])
def process_payment_legacy():
    return process_payment()


# ──────────────── GET PAYMENT BY ID ────────────────
@payment_bp.route("/payments/<payment_id>", methods=["GET"])
def get_payment_by_id(payment_id):
    """
    GET /api/payments/<payment_id>
    Returns payment details. Searches by payment _id first, then by booking_id.
    """
    # Try finding by payment _id first
    try:
        payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
    except Exception:
        payment = None

    # Fallback: find by booking_id
    if not payment:
        payment = payments_collection.find_one({"booking_id": payment_id})

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    payment["_id"] = str(payment["_id"])
    return jsonify(payment), 200


# Legacy endpoint kept for backward compatibility
@payment_bp.route("/payment/<booking_id>", methods=["GET"])
def get_payment_legacy(booking_id):
    payment = payments_collection.find_one({"booking_id": booking_id})
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    payment["_id"] = str(payment["_id"])
    return jsonify(payment), 200
