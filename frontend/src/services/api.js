import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  // Use relative /api path so Vite dev proxy forwards to the Flask backend.
  baseURL: '/api',
=======
  baseURL: "http://localhost:5000/api",
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

<<<<<<< HEAD
// Request interceptor – attach customer auth token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parkmate_token') || localStorage.getItem('parkeasy_token');
=======

// ─────────────────────────────────────────
// Request Interceptor (attach auth token)
// ─────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("parkmate_token");

>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

<<<<<<< HEAD
// Separate axios instance for admin so admin auth does not overwrite customer auth
const AdminAPI = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

AdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parkmate_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

AdminAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Response interceptor – normalize errors
=======

// ─────────────────────────────────────────
// Response Interceptor (normalize errors)
// ─────────────────────────────────────────
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
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

<<<<<<< HEAD
// Admin booking operations
export const getAllBookingsAdmin = () => AdminAPI.get('/bookings/all');
export const completeBooking = (id) => AdminAPI.put(`/exit/${id}`);

// ── Payments ──────────────────────────────────────────────────────────────────
export const makePayment = (data) => API.post('/payments', data);

export const getPaymentStatus = (id) => API.get(`/payments/${id}`);

// Admin payments & analytics
export const getAdminSummary = () => AdminAPI.get('/admin/summary');
export const getAdminPayments = () => AdminAPI.get('/admin/payments');

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// Signup with OTP
export const requestSignupOtp = (data) => API.post('/auth/register/request-otp', data);
export const verifySignupOtp = (data) => API.post('/auth/register/verify-otp', data);

// Password reset with OTP
export const requestResetOtp = (data) => API.post('/auth/forgot/request-otp', data);
export const verifyResetOtp = (data) => API.post('/auth/forgot/verify-otp', data);
export const resetPasswordWithOtp = (data) => API.post('/auth/forgot/reset', data);
=======

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
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const sendSignupOtp = (data) =>
  API.post("/auth/send-signup-otp", data);


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
<<<<<<< HEAD
  localStorage.removeItem('parkmate_token');
  localStorage.removeItem('parkmate_user');
  localStorage.removeItem('parkeasy_token');
  localStorage.removeItem('parkeasy_user');
=======
  localStorage.removeItem("parkmate_token");
  localStorage.removeItem("parkmate_user");
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
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