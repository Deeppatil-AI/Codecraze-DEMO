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
    """

    if slots_collection.count_documents({}) == 0:
        locations = [
            "Downtown Parking Hub",
            "Airport Terminal A",
            "Mall Central Parking",
            "City Square",
            "Tech Park",
        ]

        floors = ["Floor 1", "Floor 2", "Floor 3"]
        rows = ["A", "B", "C", "D"]
        cols = [1, 2, 3, 4]
        prices = [30, 40, 50, 60]

        import random

        slot_data = []

        for loc in locations:
            for flr in floors:
                for row in rows:
                    for col in cols:
                        slot_data.append({
                            "slot_number": f"{row}{col}",
                            "location": loc,
                            "floor": flr,
                            "status": random.choice(["available", "available", "occupied"]),
                            "price": random.choice(prices),
                        })

        slots_collection.insert_many(slot_data)
        print(f"✅ Seeded {len(slot_data)} parking slots into MongoDB")

    else:
        print(f"ℹ️  Slots collection already has {slots_collection.count_documents({})} documents")

    # Create indexes for faster queries
    users_collection.create_index("email", unique=True)
    slots_collection.create_index([("location", 1), ("floor", 1)])
    bookings_collection.create_index("user_id")

    print(f"✅ MongoDB initialized — database: {DB_NAME}")