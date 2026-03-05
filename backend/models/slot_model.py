"""
Slot model — CRUD operations for the `slots` collection.
"""
from bson import ObjectId
from database import get_db
from utils.helpers import serialize_doc, serialize_many


def create_slot(slot_id: str, floor: int, status: str = "available") -> dict:
    """Insert a new parking slot."""
    db = get_db()
    slot = {
        "slotId": slot_id,
        "floor": floor,
        "status": status,
    }
    result = db.slots.insert_one(slot)
    slot["_id"] = result.inserted_id
    return serialize_doc(slot)


def get_all_slots(filters: dict | None = None) -> list:
    """Return slots, optionally filtered (e.g. by floor or status)."""
    query = {}
    if filters:
        if "floor" in filters:
            query["floor"] = int(filters["floor"])
        if "status" in filters:
            query["status"] = filters["status"]
    return serialize_many(get_db().slots.find(query).sort("slotId", 1))


def get_available_slots() -> list:
    """Return only slots with status == 'available'."""
    return serialize_many(
        get_db().slots.find({"status": "available"}).sort("slotId", 1)
    )


def get_slot_by_slot_id(slot_id: str) -> dict | None:
    """Find a slot by its human-readable slotId (e.g. 'F1-S01')."""
    doc = get_db().slots.find_one({"slotId": slot_id})
    return serialize_doc(doc) if doc else None


def get_slot_by_object_id(object_id: str) -> dict | None:
    """Find a slot by its MongoDB _id."""
    doc = get_db().slots.find_one({"_id": ObjectId(object_id)})
    return serialize_doc(doc) if doc else None


def update_slot_status(slot_id: str, new_status: str) -> dict | None:
    """Set a slot's status by slotId. Returns the updated document or None."""
    db = get_db()
    result = db.slots.find_one_and_update(
        {"slotId": slot_id},
        {"$set": {"status": new_status}},
        return_document=True,
    )
    return serialize_doc(result) if result else None


def check_slot_availability(slot_id: str) -> bool:
    """Return True if the given slot is currently available."""
    doc = get_db().slots.find_one({"slotId": slot_id})
    return doc is not None and doc.get("status") == "available"
