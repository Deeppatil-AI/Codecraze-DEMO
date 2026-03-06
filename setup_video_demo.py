import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import get_db
from models.slot_model import update_slot_status

def setup_demo_data():
    db = get_db()
    
    # Reset slots to be sure we have clean state
    db.slots.update_many({}, {"$set": {"status": "available"}})
    db.bookings.delete_many({}) # Clear for clean demo

    # 1. Find the specific user
    user = db.users.find_one({"email": "deeppatil0716@gmail.om"})
    if not user:
        # If user doesn't exist, create it so the demo can proceed
        print("ℹ️ User not found, creating demo user...")
        from werkzeug.security import generate_password_hash
        user_id = db.users.insert_one({
            "name": "Deep Patil",
            "email": "deeppatil0716@gmail.om",
            "password": generate_password_hash("Deep#123"),
            "status": "active",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).inserted_id
        user = {"_id": user_id, "email": "deeppatil0716@gmail.om"}

    now = datetime.now(timezone.utc)
    
    # 1. Create an EXPIRED active booking for Overtime Demo
    # Expected exit was 90 minutes ago
    expired_exit = now - timedelta(minutes=90)
    expired_entry = now - timedelta(hours=4)
    
    booking_expired = {
        "userId": str(user["_id"]),
        "vehicleId": "MH-01-AB-1234",
        "slotId": "L0-F1-S01", # CityMall Floor 1
        "duration": 2.5,
        "entryTime": expired_entry,
        "expectedExitTime": expired_exit,
        "exitTime": None,
        "status": "active",
        "amount": 100.0,
        "totalAmount": 100.0,
        "overtimeAmount": 0.0,
        "location": "CityMall",
        "floor": 1,
        "date": expired_entry.strftime("%Y-%m-%d"),
        "time": expired_entry.strftime("%H:%M")
    }
    db.bookings.insert_one(booking_expired)
    update_slot_status("L0-F1-S01", "occupied")

    # 2. Create a normal ACTIVE booking
    active_exit = now + timedelta(hours=2)
    active_entry = now - timedelta(minutes=30)
    booking_active = {
        "userId": str(user["_id"]),
        "vehicleId": "KA-05-MN-9999",
        "slotId": "L0-B-S01", # CityMall Basement
        "duration": 2.5,
        "entryTime": active_entry,
        "expectedExitTime": active_exit,
        "exitTime": None,
        "status": "active",
        "amount": 100.0,
        "totalAmount": 100.0,
        "overtimeAmount": 0.0,
        "location": "CityMall",
        "floor": 0,
        "date": active_entry.strftime("%Y-%m-%d"),
        "time": active_entry.strftime("%H:%M")
    }
    db.bookings.insert_one(booking_active)
    update_slot_status("L0-B-S01", "occupied")

    print("✅ Demo data prepared.")
    print(" - 1 Expired booking: L0-F1-S01")
    print(" - 1 Normal booking: L0-B-S01")

if __name__ == "__main__":
    setup_demo_data()
