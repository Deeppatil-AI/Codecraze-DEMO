<<<<<<< HEAD
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
=======
from datetime import datetime
from config.db import bookings_collection, slots_collection
from bson import ObjectId


def create_booking(user_id, slot_id, full_name, vehicle, location, floor, date, time, duration, total, user_email=''):
    """Insert a new booking and mark the slot as occupied. Returns the booking id."""
    booking = {
        "user_id":    user_id,
        "user_email": user_email.lower().strip() if user_email else '',
        "slot_id":    slot_id,
        "full_name":  full_name,
        "vehicle":    vehicle,
        "location":   location,
        "floor":      floor,
        "date":       date,
        "time":       time,
        "duration":   float(duration),
        "total":      float(total),
        "status":     "confirmed",
        "created_at": datetime.utcnow().isoformat(),
    }

    result = bookings_collection.insert_one(booking)

    # Mark the slot as occupied
    try:
        slots_collection.update_one(
            {"_id": ObjectId(slot_id)},
            {"$set": {"status": "occupied"}},
        )
    except Exception:
        pass  # slot_id might not be a valid ObjectId in some cases

    return str(result.inserted_id)


def get_bookings_by_user(user_id):
    """Return all bookings for a given user by user_id, newest first."""
    bookings = list(
        bookings_collection.find({"user_id": user_id}).sort("created_at", -1)
    )
    for b in bookings:
        b["_id"] = str(b["_id"])
    return bookings


def get_bookings_by_user_email(email):
    """Return all bookings for a user by their email address, newest first."""
    email = email.lower().strip()
    bookings = list(
        bookings_collection.find({"user_email": email}).sort("created_at", -1)
    )
    for b in bookings:
        b["_id"] = str(b["_id"])
    return bookings


def get_all_bookings():
    """Return all bookings, newest first."""
    bookings = list(bookings_collection.find().sort("created_at", -1))
    for b in bookings:
        b["_id"] = str(b["_id"])
    return bookings


def get_booking_by_id(booking_id):
    """Fetch a single booking by its ObjectId."""
    try:
        booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
        if booking:
            booking["_id"] = str(booking["_id"])
        return booking
    except Exception:
        return None


def cancel_booking_by_id(booking_id):
    """Cancel a booking and free up the parking slot. Returns True on success."""
    try:
        booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return False

        # Update booking status to cancelled
        bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "cancelled"}},
        )

        # Free up the associated slot
        slot_id = booking.get("slot_id")
        if slot_id:
            try:
                slots_collection.update_one(
                    {"_id": ObjectId(slot_id)},
                    {"$set": {"status": "available"}},
                )
            except Exception:
                pass  # slot_id might not be a valid ObjectId

        return True
    except Exception:
        return False
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
