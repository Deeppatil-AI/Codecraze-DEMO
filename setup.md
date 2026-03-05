# 🚗 ParkMate Project Setup Guide

Welcome to the **ParkMate** project! Follow these instructions to set up and run the application on your local machine.

## 📋 Prerequisites

Ensure you have the following installed:
- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js (LTS)](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)

---

## 🚀 Getting Started

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment (optional but recommended):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    A `.env` file has already been created for you with the MongoDB connection string.

5.  **Start the backend server:**
    ```bash
    python3 app.py
    ```
    The backend will be running at `http://127.0.0.1:5000`.

---

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`.

---

## 🛠 Features

- **Slot Booking**: Interactive UI for booking parking slots.
- **Payment Integration**: Simulated payment flow.
- **Auth**: User registration and login.
- **Admin Dashboard**: Manage slots and view bookings.

## 🧪 Verification

- Open `http://localhost:5173` in your browser.
- Check the backend console for `✅ MongoDB initialized`.
