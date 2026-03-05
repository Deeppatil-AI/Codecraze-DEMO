"""
Floor model — CRUD operations for the `floors` collection.
"""
from bson import ObjectId
from database import get_db
from utils.helpers import serialize_doc, serialize_many


def create_floor(floor_number: int, total_slots: int) -> dict:
    """Insert a new floor document."""
    db = get_db()
    floor = {
        "floorNumber": floor_number,
        "totalSlots": total_slots,
    }
    result = db.floors.insert_one(floor)
    floor["_id"] = result.inserted_id
    return serialize_doc(floor)


def get_all_floors() -> list:
    """Return every floor, sorted by floorNumber ascending."""
    return serialize_many(
        get_db().floors.find().sort("floorNumber", 1)
    )


def get_floor_by_number(floor_number: int) -> dict | None:
    """Return a single floor document by its number."""
    doc = get_db().floors.find_one({"floorNumber": floor_number})
    return serialize_doc(doc) if doc else None
