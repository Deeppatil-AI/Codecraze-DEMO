import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

import Navbar from './Components/Navbar';
import LoginModal from './Components/LoginModal';

import Home from './pages/Home';
<<<<<<< HEAD
import BookSlot from './pages/BookSlot';

=======
import Availability from './pages/Availability';
import BookSlot from './pages/BookSlot';
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
<<<<<<< HEAD
import Availability from './pages/Availability';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoute from './admin/AdminRoute';
import CustomerRoute from './routes/CustomerRoute';
=======
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

/* ───────────────────────────────────────────────────────────── */
/* Inner component — needs access to useNavigate (inside Router) */
/* ───────────────────────────────────────────────────────────── */
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1

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
    setUser(null);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

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
<<<<<<< HEAD
        <Route
          path="/"
          element={(
            <CustomerRoute>
              <Home />
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
          path="/availability"
          element={(
            <CustomerRoute>
              <Availability />
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
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
=======
        {/* ── Public / User routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/book" element={<BookSlot />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ── Admin route — redirect non-admins to login ── */}
        <Route
          path="/admin"
          element={
            isAdmin
              ? <AdminPanel user={user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
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
