"""
Slot service — higher-level business logic around parking slots.
"""
from models.slot_model import (
    get_all_slots,
    get_available_slots,
    get_slot_by_slot_id,
    update_slot_status,
    check_slot_availability,
)


def list_slots(filters: dict | None = None) -> list:
    """Return filtered or all slots."""
    return get_all_slots(filters)


def list_available() -> list:
    """Return only available slots."""
    return get_available_slots()


def occupy_slot(slot_id: str) -> dict | None:
    """Mark a slot as occupied. Returns updated slot or None if not found."""
    return update_slot_status(slot_id, "occupied")


def release_slot(slot_id: str) -> dict | None:
    """Mark a slot as available. Returns updated slot or None if not found."""
    return update_slot_status(slot_id, "available")


def is_available(slot_id: str) -> bool:
    """Check whether a slot is currently available."""
    return check_slot_availability(slot_id)
