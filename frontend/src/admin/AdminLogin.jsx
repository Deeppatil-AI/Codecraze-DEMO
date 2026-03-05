import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaChartBar } from 'react-icons/fa';
import { loginUser } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(form);
      if (!data?.user || data.user.role !== 'admin') {
        throw new Error('Admin access only. Please use an admin account.');
      }
      // Store in admin-specific keys so it doesn't affect customer login
      localStorage.setItem('parkmate_admin_user', JSON.stringify(data.user));
      localStorage.setItem('parkmate_admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg min-h-screen pt-[60px] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: hero / copy */}
        <div className="hidden lg:block text-gray-900">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-[11px] font-semibold text-violet-700 border border-violet-200">
              <FaChartBar className="text-[10px]" />
              ParkMate Admin Console
            </span>
          </div>
          <h1 className="text-[36px] leading-tight font-extrabold mb-4">
            Control your{' '}
            <span className="gradient-text">parking operations</span> in real time.
          </h1>
          <p className="text-[14px] text-gray-500 mb-6 max-w-md">
            View live occupancy, manage bookings, and track revenue across all floors from a single,
            secure dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4 text-[12px]">
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="font-semibold text-gray-900 mb-1">Centralised control</p>
              <p className="text-gray-500">
                Update bookings and slot status instantly for your operators.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="font-semibold text-gray-900 mb-1">Revenue insights</p>
              <p className="text-gray-500">
                Track daily earnings and occupancy trends with visual summaries.
              </p>
            </div>
          </div>
        </div>

        {/* Right: login card */}
        <div className="card-static w-full max-w-md mx-auto p-8 relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#22c55e)' }}
          />

          <div className="flex flex-col items-center mb-6 mt-2">
            <div className="w-12 h-12 rounded-xl icon-purple flex items-center justify-center mb-3 shadow-sm">
              <FaUserShield className="text-white text-lg" />
            </div>
            <h2 className="text-[20px] font-extrabold text-gray-900">Admin Panel Login</h2>
            <p className="text-[12px] text-gray-400 mt-1">Sign in to manage all bookings</p>
          </div>

          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@parkeasy.com"
                  className="input-field input-field-icon"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="input-field input-field-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Signing in…' : 'Login as Admin'}
            </button>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              Default admin credentials: <span className="font-mono">admin@parkeasy.com / admin123</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

