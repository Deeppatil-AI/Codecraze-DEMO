# Smart Parking System (ParkMate)

This project contains the frontend (React) and backend (Python Flask) code for the **ParkMate** Smart Parking Management System.

## MongoDB Atlas Cluster Setup Instructions

To run the backend, you need a MongoDB Atlas cluster. Follow these steps:

1. **Create MongoDB Atlas account**: Sign up or log in at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Create cluster**:
   - Cluster Name: `parkmate-cluster`
3. **Create database**:
   - Database Name: `parkmateDB`
4. **Collections**:
   Create the following collections inside `parkmateDB`:
   - `users`
   - `vehicles`
   - `slots`
   - `floors`
   - `bookings`
5. **Add network access**:
   - Navigate to Network Access.
   - Allow access from anywhere: `0.0.0.0/0`
6. **Create database user**:
   - Navigate to Database Access.
   - username: `parkmate_admin`
   - password: `securepassword` (or any password you prefer)
7. **Connection string example**:
   ```
   mongodb+srv://parkmate_admin:password@parkmate-cluster.mongodb.net/parkmateDB
   ```
   *Replace `password` and `parkmate-cluster.mongodb.net` with your actual password and cluster address.*
8. **Add to backend `.env` file**:
   Create a `.env` file inside the `backend` directory:
   ```env
   MONGO_URI=your_connection_string
   JWT_SECRET=supersecretkey
   ```
