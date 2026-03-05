"""
Vehicle model — CRUD operations for the `vehicles` collection.
"""
from bson import ObjectId
from database import get_db
from utils.helpers import serialize_doc, serialize_many


def add_vehicle(user_id: str, vehicle_number: str, vehicle_type: str) -> dict:
    """Insert a new vehicle and return the created document."""
    db = get_db()
    vehicle = {
        "userId": user_id,
        "vehicleNumber": vehicle_number.upper().strip(),
        "vehicleType": vehicle_type,
    }
    result = db.vehicles.insert_one(vehicle)
    vehicle["_id"] = result.inserted_id
    return serialize_doc(vehicle)


def get_vehicles_by_user(user_id: str) -> list:
    """Return all vehicles belonging to a user."""
    return serialize_many(get_db().vehicles.find({"userId": user_id}))


def get_vehicle_by_id(vehicle_id: str) -> dict | None:
    """Return a single vehicle by its ObjectId string."""
    doc = get_db().vehicles.find_one({"_id": ObjectId(vehicle_id)})
    return serialize_doc(doc) if doc else None


def delete_vehicle(vehicle_id: str) -> bool:
    """Delete a vehicle. Returns True if a document was deleted."""
    result = get_db().vehicles.delete_one({"_id": ObjectId(vehicle_id)})
    return result.deleted_count > 0
