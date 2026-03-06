import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBookmark, FaCheckCircle, FaRupeeSign, FaClock, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';
import { getAdminSummary, getAllBookingsAdmin, completeBooking, getAdminPayments } from '../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card-static p-5 flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm`}
      style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
      <p className={`text-[20px] font-extrabold mt-0.5 ${color}`}>{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [payments, setPayments] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [summaryRes, bookingsRes, paymentsRes] = await Promise.all([
        getAdminSummary(),
        getAllBookingsAdmin(),
        getAdminPayments(),
      ]);
      setSummary(summaryRes);
      setBookings(bookingsRes.bookings || []);
      setPayments(paymentsRes.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkCompleted = async (bookingId) => {
    try {
      setActionLoadingId(bookingId);
      await completeBooking(bookingId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parkmate_admin_token');
    localStorage.removeItem('parkmate_admin_user');
    navigate('/admin/login');
  };

  // Build a tiny 7-day revenue series from payments
  const revenueByDay = (() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, label: d.toLocaleDateString(undefined, { weekday: 'short' }), value: 0 });
    }
    const indexByKey = Object.fromEntries(days.map((d, i) => [d.key, i]));
    payments.forEach((p) => {
      if (p.status !== 'success' || !p.createdAt) return;
      const dayKey = String(p.createdAt).slice(0, 10);
      const idx = indexByKey[dayKey];
      if (idx === undefined) return;
      const amt = Number(p.amount || 0);
      days[idx].value += Number.isFinite(amt) ? amt : 0;
    });
    const max = Math.max(1, ...days.map((d) => d.value));
    return { points: days, max };
  })();

  return (
    <div className="page-bg min-h-screen pt-[60px]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[34px] sm:text-[42px] font-extrabold text-gray-900 tracking-tight">
              Admin <span className="gradient-text">Control Center</span>
            </h1>
            <p className="text-[14px] text-gray-500 mt-2 max-w-xl">
              Monitor live bookings, track revenue and manage your parking inventory from a single,
              powerful dashboard.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-[14px] hover:bg-red-600 transition shadow-lg hover:shadow-red-500/30"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px]">
            {error}
          </div>
        )}

        {/* Stats + mini revenue chart */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              icon={<FaUsers className="text-[15px]" />}
              label="Total Users"
              value={summary.totalUsers}
              color="text-violet-700"
            />
            <StatCard
              icon={<FaBookmark className="text-[15px]" />}
              label="Total Bookings"
              value={summary.totalBookings}
              color="text-blue-700"
            />
            <StatCard
              icon={<FaCheckCircle className="text-[15px]" />}
              label="Completed"
              value={summary.completedBookings}
              color="text-emerald-700"
            />
            <StatCard
              icon={<FaRupeeSign className="text-[15px]" />}
              label="Total Revenue"
              value={`₹${summary.totalRevenue.toFixed(2)}`}
              color="text-amber-700"
            />
            {/* Mini 7‑day revenue bar chart */}
            <div className="card-static p-5 col-span-1 lg:col-span-1">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mb-3">
                Last 7 days revenue
              </p>
              <div className="flex items-end gap-1.5 h-20 mb-2">
                {revenueByDay.points.map((d) => (
                  <div
                    key={d.key}
                    className="flex-1 rounded-full bg-violet-50 relative overflow-hidden"
                    title={`₹${d.value.toFixed(0)}`}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-full"
                      style={{
                        height: `${(d.value / revenueByDay.max) * 100}%`,
                        background: 'linear-gradient(180deg,#a855f7,#4f46e5)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                {revenueByDay.points.map((d) => (
                  <span key={d.key}>{d.label[0]}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings table */}
        <div className="card-static overflow-hidden mb-6 border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-gray-900">All Bookings</h2>
            <span className="text-[12px] text-gray-400">{bookings.length} total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[13px] text-gray-400">Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-gray-400">
              No bookings found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[12px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-500">User</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Slot</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Entry</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Exit</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const isActive = b.status === 'active';
                    return (
                      <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-semibold text-gray-800">
                            {b.userName || 'Unknown user'}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {b.userEmail || b.userId}
                          </div>
                          {b.vehicleNumber && (
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Vehicle: {b.vehicleNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-mono text-[12px] text-gray-800">{b.slotId}</div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : b.status === 'cancelled'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                          >
                            {b.status === 'completed' ? (
                              <FaCheckCircle className="text-[10px]" />
                            ) : b.status === 'cancelled' ? (
                              <FaTimesCircle className="text-[10px]" />
                            ) : (
                              <FaClock className="text-[10px]" />
                            )}
                            {b.status.capitalize?.() || b.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                          {b.entryTime && new Date(b.entryTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                          {b.exitTime ? new Date(b.exitTime).toLocaleString() : '—'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          {isActive ? (
                            <button
                              onClick={() => handleMarkCompleted(b._id)}
                              disabled={actionLoadingId === b._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {actionLoadingId === b._id ? 'Updating…' : 'Mark Done'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400">No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="card-static overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-gray-900">Recent Payments</h2>
            <span className="text-[12px] text-gray-400">{payments.length} total</span>
          </div>
          {payments.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-gray-400">
              No payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[12px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-500">Booking</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Amount</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Method</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">UPI ID</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700 font-mono text-[11px]">
                        {p.bookingId}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-800 font-semibold">
                        ₹{p.amount?.toFixed ? p.amount.toFixed(2) : p.amount}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap capitalize text-gray-700">
                        {p.method}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        {p.upiId || '—'}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        {p.createdAt && new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

