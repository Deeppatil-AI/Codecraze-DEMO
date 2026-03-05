"""
Booking model — CRUD operations for the `bookings` collection.
"""
from bson import ObjectId
from database import get_db
from utils.helpers import utcnow, serialize_doc, serialize_many


def create_booking(user_id: str, vehicle_id: str, slot_id: str, amount: float | None = None) -> dict:
    """Insert a new booking with entryTime set to now."""
    db = get_db()
    booking = {
        "userId": user_id,
        "vehicleId": vehicle_id,
        "slotId": slot_id,
        "entryTime": utcnow(),
        "exitTime": None,
        "status": "active",
    }
    if amount is not None:
        booking["amount"] = float(amount)
    result = db.bookings.insert_one(booking)
    booking["_id"] = result.inserted_id
    return serialize_doc(booking)


def get_bookings_by_user(user_id: str) -> list:
    """Return all bookings for a given user, newest first."""
    return serialize_many(
        get_db().bookings.find({"userId": user_id}).sort("entryTime", -1)
    )


def get_all_bookings() -> list:
    """Return every booking (admin view), newest first."""
    return serialize_many(
        get_db().bookings.find().sort("entryTime", -1)
    )


def get_booking_by_id(booking_id: str) -> dict | None:
    """Return a single booking by ObjectId string."""
    doc = get_db().bookings.find_one({"_id": ObjectId(booking_id)})
    return serialize_doc(doc) if doc else None


def complete_booking(booking_id: str) -> dict | None:
    """Mark a booking as completed and record the exit time."""
    db = get_db()
    result = db.bookings.find_one_and_update(
        {"_id": ObjectId(booking_id), "status": "active"},
        {"$set": {"exitTime": utcnow(), "status": "completed"}},
        return_document=True,
    )
    return serialize_doc(result) if result else None


def cancel_booking(booking_id: str) -> dict | None:
    """Cancel an active booking."""
    db = get_db()
    result = db.bookings.find_one_and_update(
        {"_id": ObjectId(booking_id), "status": "active"},
        {"$set": {"exitTime": utcnow(), "status": "cancelled"}},
        return_document=True,
    )
    return serialize_doc(result) if result else None
