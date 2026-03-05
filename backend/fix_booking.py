from config.db import bookings_collection, users_collection
from bson import ObjectId

# Find the guest booking
booking = bookings_collection.find_one({"user_id": ""})
if booking:
    # Find the primary user (Nihar)
    user = users_collection.find_one({"email": "patilnihar0007@gmail.com"})
    if user:
        bookings_collection.update_one(
            {"_id": booking["_id"]},
            {"$set": {
                "user_id": str(user["_id"]),
                "user_email": user["email"]
            }}
        )
        print(f"Updated booking {booking['_id']} with user {user['email']}")
    else:
        print("User not found")
else:
    print("No guest booking found")
