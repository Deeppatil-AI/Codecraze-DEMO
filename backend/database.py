"""
MongoDB connection manager.
Creates a single PyMongo client that is reused by the entire application.
"""
from pymongo import MongoClient
from settings import Config

_client = None
_db = None


def get_db():
    """Return the MongoDB database instance, creating the client on first call."""
    global _client, _db
    if _db is None:
        print(f"Connecting to MongoDB at: {Config.MONGO_URI.split('@')[-1]}") # Log host safely
        _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
        _db = _client[Config.MONGO_DB_NAME]
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    """Create indexes for performance and uniqueness constraints."""
    db.users.create_index("email", unique=True)
    db.vehicles.create_index("userId")
    db.vehicles.create_index("vehicleNumber", unique=True)
    db.slots.create_index("slotId", unique=True)
    db.slots.create_index("status")
    db.floors.create_index("floorNumber", unique=True)
    db.bookings.create_index("userId")
    db.bookings.create_index("slotId")
