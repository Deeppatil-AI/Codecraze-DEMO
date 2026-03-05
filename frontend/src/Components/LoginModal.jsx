import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaTimes, FaEye, FaEyeSlash,
  FaUser, FaShieldAlt,
} from 'react-icons/fa';
import { loginUser } from '../services/api';

const ADMIN_EMAILS = ['admin@parkmate.com', 'admin@example.com', 'admin@test.com'];

/* ── Hard-coded admin credentials (demo) ── */
const ADMIN_CREDENTIALS = [
  { email: 'admin@parkmate.com', password: 'admin123' },
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'admin@test.com', password: 'admin' },
];

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('user');   // 'user' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isAdmin = mode === 'admin';

  const resetForm = (newMode) => {
    setMode(newMode);
    setForm({ email: '', password: '' });
    setError('');
    setShowPass(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        /* ── Admin login: validate against hard-coded list ── */
        const match = ADMIN_CREDENTIALS.find(
          (c) =>
            c.email.toLowerCase() === form.email.toLowerCase() &&
            c.password === form.password
        );
        if (!match) throw new Error('Invalid admin credentials.');

        const userData = { email: match.email, name: 'Admin', role: 'admin' };
        localStorage.setItem('parkmate_user', JSON.stringify(userData));
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        if (onLoginSuccess) onLoginSuccess(userData, 'admin');
        else onClose();
      } else {
        /* ── User login: call API ── */
        const data = await loginUser({
          email: form.email,
          password: form.password
        });

        // Make sure admin emails aren't sneaking in via user tab
        if (ADMIN_EMAILS.includes(form.email.toLowerCase())) {
          throw new Error('Use the Admin tab to login as admin.');
        }

        localStorage.setItem('parkmate_user', JSON.stringify(data.user || data));
        localStorage.setItem('parkmate_token', data.token);
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        if (onLoginSuccess) onLoginSuccess(data.user || data, 'user');
        else {
          onClose();
          window.location.reload();
        }
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

        {/* Gradient top bar — purple for user, indigo-dark for admin */}
        <div
          className="h-1.5 w-full transition-all duration-300"
          style={{
            background: isAdmin
              ? 'linear-gradient(90deg, #1e1b4b, #4338ca, #6d28d9)'
              : 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)',
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

          {/* ── Mode Switcher Tabs ── */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              id="login-tab-user"
              onClick={() => resetForm('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${!isAdmin
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaUser className="text-[11px]" />
              User
            </button>
            <button
              type="button"
              id="login-tab-admin"
              onClick={() => resetForm('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${isAdmin
                ? 'bg-white text-indigo-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaShieldAlt className="text-[11px]" />
              Admin
            </button>
          </div>

          {/* Logo + Title */}
          <div className="text-center mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm transition-all duration-300 ${isAdmin ? 'bg-indigo-900' : 'icon-purple'
                }`}
            >
              {isAdmin ? '🛡️' : '🚗'}
            </div>
            <h2 className="text-[18px] font-extrabold text-gray-900">
              {isAdmin ? 'Admin Login' : 'Welcome Back'}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {isAdmin
                ? 'Sign in to access the control panel'
                : 'Sign in to manage your bookings'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] text-center">
              {error}
            </div>
          )}

          {/* Admin demo hint */}
          {isAdmin && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px]">
              <strong>Demo credentials:</strong><br />
              Email: <span className="font-mono">admin@parkmate.com</span><br />
              Password: <span className="font-mono">admin123</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                {isAdmin ? 'Admin Email' : 'Email'}
              </label>
              <div className="relative">
                <FaEnvelope className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] ${isAdmin ? 'text-indigo-400' : 'text-violet-400'}`} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={isAdmin ? 'admin@parkmate.com' : 'you@example.com'}
                  required
                  style={isAdmin ? { '--tw-ring-color': '#4338ca' } : {}}
                  className={`input-field input-field-icon ${isAdmin ? 'focus:border-indigo-500' : ''}`}
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] ${isAdmin ? 'text-indigo-400' : 'text-violet-400'}`} />
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

            {/* Remember / Forgot — only for user mode */}
            {!isAdmin && (
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
            )}

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className={`w-full py-3.5 text-[14px] rounded-xl font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 ${isAdmin
                ? 'bg-gradient-to-r from-indigo-900 to-indigo-700 hover:from-indigo-800 hover:to-indigo-600 shadow-md hover:shadow-indigo-300/40 hover:-translate-y-[1px]'
                : 'btn-primary'
                }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  {isAdmin ? <FaShieldAlt className="text-[12px]" /> : null}
                  {isAdmin ? 'Access Admin Panel' : 'Login to ParkMate'}
                </>
              )}
            </button>
          </form>

          {/* Sign up link — only for user */}
          {!isAdmin && (
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
          )}

          {/* Admin note */}
          {isAdmin && (
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Admin accounts are managed by your organization.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
