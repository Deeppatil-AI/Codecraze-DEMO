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
    floors_config = [
        {"floorNumber": 1, "totalSlots": 10},
        {"floorNumber": 2, "totalSlots": 10},
        {"floorNumber": 3, "totalSlots": 10},
    ]

    for fc in floors_config:
        create_floor(fc["floorNumber"], fc["totalSlots"])
        for s in range(1, fc["totalSlots"] + 1):
            slot_id = f"F{fc['floorNumber']}-S{s:02d}"
            create_slot(slot_id, fc["floorNumber"])
        print(f"   ✅ Floor {fc['floorNumber']}  →  {fc['totalSlots']} slots created")

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
