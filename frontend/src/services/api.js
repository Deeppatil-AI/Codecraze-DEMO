import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor – attach customer auth token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parkmate_token') || localStorage.getItem('parkeasy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Separate axios instance for admin so admin auth does not overwrite customer auth
const AdminAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

// Response interceptor – normalize errors and log for production debugging
API.interceptors.response.use(
  (response) => {
    console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
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
  localStorage.removeItem('parkmate_token');
  localStorage.removeItem('parkmate_user');
  localStorage.removeItem('parkeasy_token');
  localStorage.removeItem('parkeasy_user');
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