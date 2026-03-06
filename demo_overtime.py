import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import get_db
from services.booking_service import exit_parking
from models.slot_model import update_slot_status
from bson import ObjectId

def demo_overtime():
    db = get_db()
    
    # 1. Find a user and a slot
    user = db.users.find_one({"email": "user@parkeasy.com"})
    if not user:
        print("❌ Sample user not found. Please run seed_data.py first.")
        return
        
    slot = db.slots.find_one({"status": "available"})
    if not slot:
        # If no available, just take any
        slot = db.slots.find_one()
    
    if not slot:
        print("❌ No slots found.")
        return

    # 2. Create a booking that SHOULD HAVE EXITED 2 HOURS AGO
    now = datetime.now(timezone.utc)
    expected_exit = now - timedelta(hours=2)
    entry_time = now - timedelta(hours=5) # 5 hours ago
    
    print(f"Creating a simulated booking:")
    print(f" - User: {user['email']}")
    print(f" - Slot: {slot['slotId']}")
    print(f" - Entry Time: {entry_time}")
    print(f" - Expected Exit: {expected_exit}")
    print(f" - Current Time: {now}")
    
    booking_doc = {
        "userId": str(user["_id"]),
        "vehicleId": "DEMO_VEHICLE_ID",
        "slotId": slot["slotId"],
        "duration": 3.0,
        "entryTime": entry_time,
        "expectedExitTime": expected_exit,
        "exitTime": None,
        "status": "active",
        "amount": 120.0, # 3 hours @ 40
        "totalAmount": 120.0,
        "overtimeAmount": 0.0,
        "location": "CityMall",
        "date": entry_time.strftime("%Y-%m-%d"),
        "time": entry_time.strftime("%H:%M")
    }
    
    result = db.bookings.insert_one(booking_doc)
    booking_id = str(result.inserted_id)
    
    # Occupy the slot in DB for realism
    update_slot_status(slot["slotId"], "occupied")
    
    print(f"\n✅ Created booking ID: {booking_id}")
    print("Processing exit now...")
    
    # 3. Process exit to calculate overtime
    updated_booking, error = exit_parking(booking_id)
    
    if error:
        print(f"❌ Error: {error}")
        return
        
    print("\n🎉 Overtime Calculation Result:")
    print(f" - Base Amount: ₹{updated_booking.get('amount')}")
    print(f" - Expected Exit: {updated_booking.get('expectedExitTime')}")
    print(f" - Real Exit Time: {updated_booking.get('exitTime')}")
    print(f" - Overtime Amount: ₹{updated_booking.get('overtimeAmount')} (Calculated at ₹40/hr)")
    print(f" - Total Charged: ₹{updated_booking.get('totalAmount')}")
    print(f" - Status: {updated_booking.get('status')}")

if __name__ == "__main__":
    demo_overtime()
