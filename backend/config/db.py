import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# ── Collections ──
users_collection = db["users"]
slots_collection = db["slots"]
bookings_collection = db["bookings"]
payments_collection = db["payments"]


def init_db():
    """
    Seed the database with sample parking slots if the slots collection is empty.
    Locations and floors are kept in sync with the frontend Availability.jsx constants.
    """

    # ── Frontend Availability.jsx constants (keep in sync) ──────────────────
    LOCATIONS = [
        "CityMall",
        "Downtown Parking Hub",
        "Airport Terminal A",
        "Airport Terminal B",
        "Mall Central Parking",
        "Tech Park Zone 1",
        "Railway Station Lot",
    ]
    FLOORS = ["Floor 1", "Floor 2", "Floor 3", "Floor 4", "Basement"]
    # ────────────────────────────────────────────────────────────────────────

    existing_count = slots_collection.count_documents({})
    existing_locations = set(slots_collection.distinct("location")) if existing_count > 0 else set()
    expected_locations = set(LOCATIONS)

    # Reseed if empty OR if stored locations no longer match the frontend list
    if existing_count == 0 or not expected_locations.issubset(existing_locations):
        if existing_count > 0:
            slots_collection.drop()
            print("🔄 Reseeding slots — location list has changed")

        rows = ["A", "B", "C", "D"]
        cols = [1, 2, 3, 4]
        prices = [30, 40, 50, 60]

        slot_data = []
        price_idx = 0
        for loc in LOCATIONS:
            for flr in FLOORS:
                for row in rows:
                    for col in cols:
                        slot_data.append({
                            "slot_number": f"{row}{col}",
                            "location": loc,
                            "floor": flr,
                            "status": "available",
                            "price": prices[price_idx % len(prices)],
                        })
                        price_idx += 1

        slots_collection.insert_many(slot_data)
        print(f"✅ Seeded {len(slot_data)} parking slots into MongoDB")
    else:
        print(f"ℹ️  Slots collection already has {existing_count} documents")

    # Create indexes for faster queries
    users_collection.create_index("email", unique=True)
    slots_collection.create_index([("location", 1), ("floor", 1)])
    bookings_collection.create_index("user_id")

    print(f"✅ MongoDB initialized — database: {DB_NAME}")