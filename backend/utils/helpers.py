"""
Shared helper functions used across the application.
"""
import os
import random
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone
from bson import ObjectId


def utcnow() -> datetime:
    """Return the current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)


def serialize_doc(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-safe dict.

    - Converts ObjectId fields to strings.
    - Converts datetime fields to ISO-8601 strings.
    """
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_doc(v) if isinstance(v, dict) else
                str(v) if isinstance(v, ObjectId) else
                v.isoformat() if isinstance(v, datetime) else v
                for v in value
            ]
        else:
            result[key] = value
    return result


def serialize_many(docs) -> list:
    """Serialize a list/cursor of MongoDB documents."""
    return [serialize_doc(d) for d in docs]


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the given length."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))



