"""
Seed script — populates floors and parking slots for testing.

Run:
    python seed_data.py

This will:
 1. Clear existing floors and slots collections.
 2. Insert 3 floors with 10 slots each (30 total slots).
 3. Create an admin user (admin@parkeasy.com / admin123).
"""
from database import get_db
from models.user_model import create_user, find_by_email
from models.floor_model import create_floor
from models.slot_model import create_slot


def seed():
    db = get_db()

    # ── Clear old data ────────────────────────────────────────────────────────
    db.floors.delete_many({})
    db.slots.delete_many({})
    print("🗑️  Cleared floors and slots collections.")

    # ── Seed floors & slots ───────────────────────────────────────────────────
    locations = [
        'CityMall',
        'Downtown Parking Hub',
        'Airport Terminal A',
        'Airport Terminal B',
        'Mall Central Parking',
        'Tech Park Zone 1',
        'Railway Station Lot',
    ]

    floors_config = [
        {"floorNumber": 0, "totalSlots": 5, "name": "Basement"},
        {"floorNumber": 1, "totalSlots": 10, "name": "Floor 1"},
        {"floorNumber": 2, "totalSlots": 10, "name": "Floor 2"},
        {"floorNumber": 3, "totalSlots": 10, "name": "Floor 3"},
        {"floorNumber": 4, "totalSlots": 5, "name": "Floor 4"},
    ]

    # ── Seed floors ───────────────────────────────────────────────────
    for fc in floors_config:
        create_floor(fc["floorNumber"], fc["totalSlots"])
        print(f"   ✅ Floor {fc['floorNumber']} globally created")

    for idx, loc in enumerate(locations):
        print(f"📍 Seeding slots for {loc}...")
        for fc in floors_config:
            for s in range(1, fc["totalSlots"] + 1):
                floor_prefix = "B" if fc["floorNumber"] == 0 else f"F{fc['floorNumber']}"
                # Add location index to ensure uniqueness even if names start with same 3 letters
                slot_id = f"L{idx}-{floor_prefix}-S{s:02d}"
                create_slot(slot_id, fc["floorNumber"], location=loc)
            print(f"   ✅ {fc['name']}  →  {fc['totalSlots']} slots seeded")

    # ── Seed admin user ───────────────────────────────────────────────────────
    admin_email = "admin@parkeasy.com"
    if find_by_email(admin_email) is None:
        create_user("Admin", admin_email, "admin123", role="admin")
        print(f"   ✅ Admin user created  →  {admin_email} / admin123")
    else:
        print(f"   ℹ️  Admin user already exists ({admin_email})")

    # ── Seed a sample customer ────────────────────────────────────────────────
    customer_email = "user@parkeasy.com"
    if find_by_email(customer_email) is None:
        create_user("John Doe", customer_email, "user123", role="customer")
        print(f"   ✅ Sample customer created  →  {customer_email} / user123")
    else:
        print(f"   ℹ️  Sample customer already exists ({customer_email})")

    print("\n🎉  Seeding complete!  30 parking slots across 3 floors.\n")


if __name__ == "__main__":
    seed()
