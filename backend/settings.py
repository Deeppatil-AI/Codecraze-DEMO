"""
Application configuration.
Reads values from environment variables with sensible defaults.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "parkeasy-super-secret-key-change-in-prod")
    JWT_SECRET = os.getenv("JWT_SECRET", "parkeasy-jwt-secret-key-change-in-prod")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "parkeasy")

    # CORS — allow the React dev/preview servers and deployed URLs
    # Supports common localhost variants, Vite preview, and production deployments
    CORS_ORIGINS = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,https://codecraze-demo.vercel.app,https://codecraze-demo.onrender.com",
        ).split(",")
    ]

    # Parking rate (per hour) — kept configurable for future pricing module
    PARKING_RATE_PER_HOUR = float(os.getenv("PARKING_RATE_PER_HOUR", 20.0))
