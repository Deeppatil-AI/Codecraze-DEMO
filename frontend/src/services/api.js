import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});


// ─────────────────────────────────────────
// Request Interceptor (attach auth token)
// ─────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("parkeasy_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ─────────────────────────────────────────
// Response Interceptor (normalize errors)
// ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      "An error occurred";

    return Promise.reject(new Error(message));
  }
);


// ─────────────────────────────────────────
// Slots APIs
// ─────────────────────────────────────────
export const getSlots = (params = {}) => API.get("/slots", { params });

export const getSlotById = (id) => API.get(`/slots/${id}`);

export const checkAvailability = (data) => API.post("/slots/check", data);

export const getLocations = () => API.get("/locations");

export const getFloors = (location) =>
  API.get("/floors", location ? { params: { location } } : {});


// ─────────────────────────────────────────
// Admin Slot Controls
// ─────────────────────────────────────────
export const resetAllSlots = () => API.post("/admin/slots/reset");


// ─────────────────────────────────────────
// Bookings APIs
// ─────────────────────────────────────────
export const bookSlot = (data) => API.post("/bookings", data);

export const getBookings = (params = {}) =>
  API.get("/bookings", { params });

export const getBookingById = (id) => API.get(`/bookings/${id}`);

export const cancelBooking = (id) => API.delete(`/bookings/${id}`);


// ─────────────────────────────────────────
// Payments APIs
// ─────────────────────────────────────────
export const makePayment = (data) => API.post("/payments", data);

export const getPaymentStatus = (id) => API.get(`/payments/${id}`);


// ─────────────────────────────────────────
// Auth APIs
// ─────────────────────────────────────────
export const loginUser = (credentials) =>
  API.post("/auth/login", credentials);

export const registerUser = (data) =>
  API.post("/auth/register", data);


// ─────────────────────────────────────────
// Forgot Password APIs
// ─────────────────────────────────────────
export const forgotPassword = (data) =>
  API.post("/forgot-password", data);

export const verifyOtp = (data) =>
  API.post("/verify-otp", data);

export const resetPassword = (data) =>
  API.post("/reset-password", data);


// ─────────────────────────────────────────
// Logout
// ─────────────────────────────────────────
export const logoutUser = () => {
  localStorage.removeItem("parkeasy_token");
  localStorage.removeItem("parkeasy_user");
};


// ─────────────────────────────────────────
// Contact API
// ─────────────────────────────────────────
export const sendContactMessage = (data) =>
  API.post("/contact", data);


// ─────────────────────────────────────────
// Admin APIs
// ─────────────────────────────────────────
export const getAdminStats = () => API.get("/admin/stats");

export const getAdminUsers = (q = "") =>
  API.get("/admin/users", { params: q ? { q } : {} });


// Export Axios instance if needed
export default API;