import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';

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
import AdminPanel from './pages/AdminPanel';

/* ───────────────────────────────────────────────────────────── */
/* Inner component — needs access to useNavigate (inside Router) */
/* ───────────────────────────────────────────────────────────── */
function AppInner() {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('parkeasy_user');
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
    localStorage.removeItem('parkeasy_user');
    setUser(null);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Navbar is hidden when viewing the Admin Panel as admin */}
      {!isAdmin && (
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
