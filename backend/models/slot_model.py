<<<<<<< HEAD
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
=======
from config.db import slots_collection
from bson import ObjectId


def get_all_slots(location=None, floor=None):
    """Return all slots, optionally filtered by location and floor."""
    query = {}
    if location:
        query["location"] = location
    if floor:
        query["floor"] = floor

    slots = list(slots_collection.find(query).sort("slot_number", 1))
    for s in slots:
        s["_id"] = str(s["_id"])
    return slots


def get_slot_by_id(slot_id):
    """Fetch a single slot by its ObjectId."""
    try:
        slot = slots_collection.find_one({"_id": ObjectId(slot_id)})
        if slot:
            slot["_id"] = str(slot["_id"])
        return slot
    except Exception:
        return None


def update_slot_status(slot_id, status):
    """Update a slot's availability status."""
    slots_collection.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"status": status}},
    )


def get_locations():
    """Return a list of distinct locations."""
    return slots_collection.distinct("location")


def get_floors(location=None):
    """Return a list of distinct floors, optionally for a specific location."""
    query = {"location": location} if location else {}
    return slots_collection.distinct("floor", query)
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
