<<<<<<< HEAD
"""
ParkEasy — Smart Parking Management System
Flask application entry-point.

Run:
    python app.py
"""
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config

# ── Blueprint imports ─────────────────────────────────────────────────────────
from routes.auth_routes    import auth_bp
from routes.user_routes    import user_bp
from routes.vehicle_routes import vehicle_bp
from routes.slot_routes    import slot_bp
from routes.booking_routes import booking_bp
from routes.floor_routes   import floor_bp
from routes.payment_routes import payment_bp
from routes.admin_routes   import admin_bp
from routes.contact_routes import contact_bp


def create_app() -> Flask:
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    # ── Register Blueprints ───────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(vehicle_bp)
    app.register_blueprint(slot_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(floor_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(admin_bp)

    # ── Health-check endpoint ─────────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "ParkEasy API"}), 200

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"message": "Internal server error"}), 500

    return app


# ── Run directly ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app()
    print("\n 🚗  ParkEasy API running on http://localhost:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
=======
import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_mail import Mail

# ── Load Environment Variables ─────────────
load_dotenv()

from config.db import init_db
from routes.auth_routes import auth_bp
from routes.slot_routes import slot_bp
from routes.booking_routes import booking_bp
from routes.payment_routes import payment_bp
from routes.contact_routes import contact_bp
from routes.admin_routes import admin_bp

app = Flask(__name__)

# Enable CORS
CORS(app)

# ── Mail Configuration ─────────────────────
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "True") == "True"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

mail = Mail(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(slot_bp, url_prefix="/api")
app.register_blueprint(booking_bp, url_prefix="/api")
app.register_blueprint(payment_bp, url_prefix="/api")
app.register_blueprint(contact_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")


@app.route("/")
def home():
    return jsonify({
        "message": "🚗 ParkMate backend is running!",
        "status": "ok"
    })


@app.route("/api")
def api_root():
    return jsonify({
        "message": "ParkMate API (MongoDB)",
        "database": "parkmate_db"
    })


# Initialize DB
init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
