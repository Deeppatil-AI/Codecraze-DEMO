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
