import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaTimes, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import { loginUser } from '../services/api';

const ADMIN_EMAILS = ['admin@parkmate.com', 'admin@example.com', 'admin@test.com'];

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      /* ── User login: call API ── */
      const data = await loginUser({
        email: form.email,
        password: form.password
      });

      // Make sure admin emails aren't sneaking in via user tab
      if (ADMIN_EMAILS.includes(form.email.toLowerCase())) {
        throw new Error('Use the Admin page to login as admin.');
      }

      localStorage.setItem('parkmate_user', JSON.stringify(data.user || data));
      localStorage.setItem('parkmate_token', data.token);
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      if (onLoginSuccess) onLoginSuccess(data.user || data, 'user');
      else {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] animate-scale-in overflow-hidden">

        {/* Gradient top bar */}
        <div
          className="h-1.5 w-full transition-all duration-300"
          style={{
            background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)',
          }}
        />

        <div className="p-7">
          {/* Close */}
          <button
            onClick={onClose}
            id="login-close"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <FaTimes className="text-sm" />
          </button>

          {/* Logo + Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm transition-all duration-300 icon-purple">
              🚗
            </div>
            <h2 className="text-[18px] font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Sign in to manage your bookings
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-violet-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input-field input-field-icon"
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-violet-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-field input-field-icon pr-10"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-[11px]"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] text-gray-500 cursor-pointer">
                <input type="checkbox" className="accent-violet-600 w-3.5 h-3.5" />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                onClick={onClose}
                className="text-[12px] text-violet-600 hover:text-violet-800 font-semibold transition"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full py-3.5 text-[14px] rounded-xl font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 btn-primary"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login to ParkMate
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-5 text-center text-[12px] text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              onClick={onClose}
              className="text-violet-600 hover:text-violet-800 font-bold transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
