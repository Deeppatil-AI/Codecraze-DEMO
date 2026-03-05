import axios from 'axios';

const API = axios.create({
  // Use relative /api path so Vite dev proxy forwards to the Flask backend.
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Slots ────────────────────────────────────────────────────────────────────
export const getSlots = (params = {}) => API.get('/slots', { params });

export const getSlotById = (id) => API.get(`/slots/${id}`);

export const checkAvailability = (data) => API.post('/slots/check', data);

// ── Bookings ─────────────────────────────────────────────────────────────────
export const bookSlot = (data) => API.post('/bookings', data);

export const getBookings = () => API.get('/bookings');

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

export const logoutUser = () => {
  localStorage.removeItem('parkmate_token');
  localStorage.removeItem('parkmate_user');
  localStorage.removeItem('parkeasy_token');
  localStorage.removeItem('parkeasy_user');
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const sendContactMessage = (data) => API.post('/contact', data);

export default API;
