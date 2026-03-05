"""
User model — CRUD operations for the `users` collection.
"""
import bcrypt
from bson import ObjectId
from database import get_db
from utils.helpers import utcnow, serialize_doc


def create_user(name: str, email: str, password: str, role: str = "customer") -> dict:
    """Hash the password and insert a new user document. Returns the created user (sans password)."""
    db = get_db()
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = {
        "name": name,
        "email": email.lower().strip(),
        "password": hashed,
        "role": role,
        "createdAt": utcnow(),
    }
    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id
    return _safe(user)


def find_by_email(email: str) -> dict | None:
    """Return the full user document (including hashed password) or None."""
    return get_db().users.find_one({"email": email.lower().strip()})


def find_by_id(user_id: str) -> dict | None:
    """Return a user document by ObjectId string (without password)."""
    doc = get_db().users.find_one({"_id": ObjectId(user_id)})
    return _safe(doc) if doc else None


def get_all_users() -> list:
    """Return all users (admin utility). Passwords excluded."""
    return [_safe(u) for u in get_db().users.find()]


def verify_password(plain: str, hashed: bytes) -> bool:
    """Check a plain-text password against a bcrypt hash."""
    if isinstance(hashed, str):
        hashed = hashed.encode()
    return bcrypt.checkpw(plain.encode(), hashed)


def update_password(email: str, new_password: str) -> None:
    """Update the user's password hash for a given email."""
    db = get_db()
    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
    db.users.update_one(
        {"email": email.lower().strip()},
        {
            "$set": {
                "password": hashed,
                "updatedAt": utcnow(),
            }
        },
    )


# ── private helpers ──────────────────────────────────────────────────────────

def _safe(doc: dict) -> dict:
    """Return a serialized copy with the password field removed."""
    if doc is None:
        return None
    doc = serialize_doc(doc)
    doc.pop("password", None)
    return doc
