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


def book_slot(user_id: str, vehicle_id: str, slot_id: str, amount: float | None = None) -> tuple[dict | None, str | None]:
    """
    Attempt to book a slot.

    Returns:
        (booking_doc, None) on success
        (None, error_message) on failure
    """
    if not is_available(slot_id):
        return None, "Slot is not available"

    # Mark slot as occupied
    updated_slot = occupy_slot(slot_id)
    if updated_slot is None:
        return None, "Failed to update slot status"

    booking = create_booking(user_id, vehicle_id, slot_id, amount=amount)
    return booking, None


def exit_parking(booking_id: str) -> tuple[dict | None, str | None]:
    """
    Complete a booking and release the slot.

    Returns:
        (booking_doc, None) on success
        (None, error_message) on failure
    """
    booking = complete_booking(booking_id)
    if booking is None:
        return None, "Booking not found or already completed"

    # Release the slot so it can be booked again
    release_slot(booking["slotId"])
    return booking, None


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
