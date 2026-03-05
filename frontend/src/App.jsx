import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

import Navbar from './Components/Navbar';
import LoginModal from './Components/LoginModal';

import Home from './pages/Home';
import Availability from './pages/Availability';
import BookSlot from './pages/BookSlot';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoute from './admin/AdminRoute';
import CustomerRoute from './routes/CustomerRoute';

/* ───────────────────────────────────────────────────────────── */
/* Inner component — needs access to useNavigate (inside Router) */
/* ───────────────────────────────────────────────────────────── */
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('parkmate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Allow other components to open the login modal via custom event
  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener('openLogin', handler);
    return () => window.removeEventListener('openLogin', handler);
  }, []);

  // Sync user state if localStorage is updated externally (e.g. Signup page, cross-tab)
  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = localStorage.getItem('parkmate_user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };
    // 'storage' fires on cross-tab changes; 'userLoggedIn' fires same-tab (dispatched by Signup etc.)
    window.addEventListener('storage', syncUser);
    window.addEventListener('userLoggedIn', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('userLoggedIn', syncUser);
    };
  }, []);

  /**
   * Called by LoginModal on successful authentication.
   * @param {object} userData  – the logged-in user object
   * @param {string} role      – 'admin' | 'user'
   */
  const handleLoginSuccess = (userData, role) => {
    setUser(userData);
    setLoginOpen(false);
    if (role === 'admin') {
      navigate('/admin');
    }
    // users stay wherever they are — no redirect needed
  };

  const handleLogout = () => {
    localStorage.removeItem('parkmate_user');
    localStorage.removeItem('parkmate_token');
    localStorage.removeItem('parkmate_admin');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      {/* Navbar is hidden only on the Admin Panel page itself */}
      {location.pathname !== '/admin' && (
        <Navbar
          onLoginClick={() => setLoginOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Routes>
        {/* ── Public / User routes ── */}
        <Route
          path="/"
          element={(
            <CustomerRoute>
              <Home />
            </CustomerRoute>
          )}
        />
        <Route
          path="/availability"
          element={(
            <CustomerRoute>
              <Availability />
            </CustomerRoute>
          )}
        />
        <Route
          path="/book"
          element={(
            <CustomerRoute>
              <BookSlot />
            </CustomerRoute>
          )}
        />
        <Route
          path="/payment"
          element={(
            <CustomerRoute>
              <Payment />
            </CustomerRoute>
          )}
        />
        <Route
          path="/bookings"
          element={(
            <CustomerRoute>
              <MyBookings />
            </CustomerRoute>
          )}
        />
        <Route
          path="/contact"
          element={(
            <CustomerRoute>
              <Contact />
            </CustomerRoute>
          )}
        />
        <Route
          path="/signup"
          element={(
            <CustomerRoute>
              <Signup />
            </CustomerRoute>
          )}
        />
        <Route
          path="/forgot-password"
          element={(
            <CustomerRoute>
              <ForgotPassword />
            </CustomerRoute>
          )}
        />
        <Route
          path="/dashboard"
          element={(
            <CustomerRoute>
              <Dashboard />
            </CustomerRoute>
          )}
        />

        {/* ── Admin routes ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
        />
      </Routes>
    </>
  );
}

/* ───────────────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
