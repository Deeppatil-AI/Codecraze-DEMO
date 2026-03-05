from datetime import datetime
from config.db import bookings_collection, slots_collection
from bson import ObjectId


def create_booking(user_id, slot_id, full_name, vehicle, location, floor, date, time, duration, total):
    """Insert a new booking and mark the slot as occupied. Returns the booking id."""
    booking = {
        "user_id": user_id,
        "slot_id": slot_id,
        "full_name": full_name,
        "vehicle": vehicle,
        "location": location,
        "floor": floor,
        "date": date,
        "time": time,
        "duration": int(duration),
        "total": int(total),
        "status": "confirmed",
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
    """Return all bookings for a given user, newest first."""
    bookings = list(
        bookings_collection.find({"user_id": user_id}).sort("created_at", -1)
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
