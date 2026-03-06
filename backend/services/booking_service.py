"""
Booking service — orchestrates the booking workflow.

Coordinates between the booking model and the slot service so that
slot status is always kept in sync with booking lifecycle events.
"""
from models.booking_model import (
    create_booking,
    get_bookings_by_user,
    get_all_bookings,
    get_booking_by_id,
    complete_booking,
    cancel_booking as cancel_booking_model,
)
from services.slot_service import occupy_slot, release_slot, is_available
from database import get_db


from datetime import datetime, timedelta, timezone
from utils.helpers import utcnow

def book_slot(user_id: str, vehicle_id: str, slot_id: str, duration: float, start_time: datetime | None = None, amount: float | None = None) -> tuple[dict | None, str | None]:
    """
    Attempt to book a slot.
    """
    if not is_available(slot_id):
        return None, "Slot is not available"

    # Mark slot as occupied
    updated_slot = occupy_slot(slot_id)
    if updated_slot is None:
        return None, "Failed to update slot status"

    # If start_time is None, assume immediate booking (not used with new restrictions but good for safety)
    if start_time is None:
        start_time = utcnow()
    
    expected_exit_time = start_time + timedelta(hours=duration)

    booking = create_booking(user_id, vehicle_id, slot_id, duration, expected_exit_time, amount=amount)
    return booking, None


def exit_parking(booking_id: str) -> tuple[dict | None, str | None]:
    """
    Complete a booking, calculate overtime if any, and release the slot.
    """
    db = get_db()
    from bson import ObjectId
    from utils.helpers import serialize_doc

    booking_doc = db.bookings.find_one({"_id": ObjectId(booking_id), "status": "active"})
    if not booking_doc:
        return None, "Booking not found or already completed"

    now = utcnow()
    expected_exit = booking_doc.get("expectedExitTime")
    
    # Ensure expected_exit is aware for comparison if now is aware
    if expected_exit and expected_exit.tzinfo is None and now.tzinfo is not None:
        expected_exit = expected_exit.replace(tzinfo=timezone.utc)
    elif expected_exit and expected_exit.tzinfo is not None and now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    overtime_amount = 0.0
    
    # Calculate overtime if applicable
    if expected_exit and now > expected_exit:
        overtime_delta = now - expected_exit
        overtime_hours = overtime_delta.total_seconds() / 3600.0
        # Charge ₹40 per hour for overtime (adjust if needed)
        overtime_amount = round(overtime_hours * 40.0, 2)

    base_amount = booking_doc.get("amount", 0.0)
    total_amount = base_amount + overtime_amount

    # Mark as completed
    result = db.bookings.find_one_and_update(
        {"_id": ObjectId(booking_id)},
        {
            "$set": {
                "exitTime": now,
                "status": "completed",
                "overtimeAmount": overtime_amount,
                "totalAmount": total_amount
            }
        },
        return_document=True
    )

    if result:
        release_slot(result["slotId"])
        return serialize_doc(result), None
    
    return None, "Failed to complete booking"


def cancel(booking_id: str) -> tuple[dict | None, str | None]:
    """
    Cancel an active booking and free the slot.
    """
    booking = cancel_booking_model(booking_id)
    if booking is None:
        return None, "Booking not found or already completed/cancelled"

    release_slot(booking["slotId"])
    return booking, None


def user_bookings(user_id: str) -> list:
    """Get all bookings for a user."""
    return get_bookings_by_user(user_id)


def all_bookings() -> list:
    """Get all bookings (admin)."""
    return get_all_bookings()


def booking_detail(booking_id: str) -> dict | None:
    """Get a single booking by ID."""
    return get_booking_by_id(booking_id)
