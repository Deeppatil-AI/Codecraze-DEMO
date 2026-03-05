from config.db import users_collection
from bson import ObjectId


def create_user(name, email, password, role="user"):
    """Insert a new user and return the inserted id as string."""
    from datetime import datetime
    result = users_collection.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
    })
    return str(result.inserted_id)


def get_user_by_email(email):
    """Fetch a user document by email."""
    user = users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user


def get_user_by_id(user_id):
    """Fetch a user document by ObjectId."""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
        return user
    except Exception:
        return None


def update_user_password(email, new_password):
    """Update a user's password by email."""
    users_collection.update_one(
        {"email": email},
        {"$set": {"password": new_password}},
    )
