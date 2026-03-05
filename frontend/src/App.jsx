import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './Components/Navbar';
import LoginModal from './Components/LoginModal';

import Home from './pages/Home';
import BookSlot from './pages/BookSlot';

import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Availability from './pages/Availability';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoute from './admin/AdminRoute';
import CustomerRoute from './routes/CustomerRoute';

function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  // Allow other components to open the login modal via custom event
  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener('openLogin', handler);
    return () => window.removeEventListener('openLogin', handler);
  }, []);

  return (
    <BrowserRouter>
      <Navbar onLoginClick={() => setLoginOpen(true)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      <Routes>
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
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
