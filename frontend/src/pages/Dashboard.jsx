import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaRupeeSign, FaBookmark, FaCheckCircle, FaClock,
  FaCalendarAlt, FaMapMarkerAlt, FaBan, FaLock,
  FaChartBar, FaUser, FaCarAlt, FaTrophy, FaArrowUp, FaArrowDown, FaSync,
} from 'react-icons/fa';
import { getBookings } from '../services/api';

/* ── helpers ──────────────────────────────────────────────────── */
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusCfg = {
  active:    { cls: 'status-active',    dot: 'bg-emerald-500', label: 'Active',     icon: '🟢' },
  confirmed: { cls: 'status-active',    dot: 'bg-emerald-500', label: 'Confirmed',  icon: '🟢' },
  paid:      { cls: 'status-completed', dot: 'bg-blue-500',    label: 'Paid',       icon: '🔵' },
  completed: { cls: 'status-completed', dot: 'bg-blue-500',    label: 'Completed',  icon: '🔵' },
  cancelled: { cls: 'status-cancelled', dot: 'bg-red-400',     label: 'Cancelled',  icon: '🔴' },
};

/* ── tiny bar chart ───────────────────────────────────────────── */
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-700 ease-out"
            style={{
              height: `${Math.max(4, (d.value / max) * 56)}px`,
              background: d.current
                ? 'linear-gradient(to top, #7c3aed, #8b5cf6)'
                : '#ddd6fe',
            }}
            title={`${d.label}: ₹${d.value}`}
          />
          <span className={`text-[9px] font-medium ${d.current ? 'text-violet-700' : 'text-gray-400'}`}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── donut chart (CSS) ────────────────────────────────────────── */
const DonutChart = ({ completed, active, cancelled }) => {
  const total = completed + active + cancelled || 1;
  const c = Math.round((completed / total) * 100);
  const a = Math.round((active / total) * 100);
  const x = 100 - c - a;
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
        {/* completed – blue */}
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
          strokeDasharray={`${c} ${100 - c}`} strokeLinecap="round" />
        {/* active – green */}
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
          strokeDasharray={`${a} ${100 - a}`} strokeDashoffset={`${-c}`} strokeLinecap="round" />
        {/* cancelled – red */}
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f87171" strokeWidth="3"
          strokeDasharray={`${x} ${100 - x}`} strokeDashoffset={`${-(c + a)}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-gray-800">{total}</span>
        <span className="text-[8px] text-gray-400">Bookings</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const [user, setUser]         = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState('all');

  const fetchBookings = (parsed) => {
    if (!parsed) return;
    setLoading(true);
    const params = {};
    if (parsed._id || parsed.id) params.user_id    = parsed._id || parsed.id;
    if (parsed.email)            params.user_email = parsed.email;
    getBookings(params)
      .then((res) => {
        const all = res.bookings || res || [];
        setBookings(all);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem('parkeasy_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchBookings(parsed);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── derived stats ── */
  const totalBookings = bookings.length;
  const activeCount   = bookings.filter(b => ['active','confirmed'].includes(b.status)).length;
  const completedCount= bookings.filter(b => ['completed','paid'].includes(b.status)).length;
  const cancelledCount= bookings.filter(b => b.status === 'cancelled').length;
  const totalSpent    = bookings.reduce((s, b) => s + (b.total || b.amount || 0), 0);
  const avgSpend      = totalBookings ? Math.round(totalSpent / totalBookings) : 0;
  const favLocation   = (() => {
    const freq = {};
    bookings.forEach(b => { if (b.location) freq[b.location] = (freq[b.location] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  /* ── monthly spend chart data ── */
  const now = new Date();
  const monthData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = MONTH_LABELS[d.getMonth()];
    const value = bookings
      .filter(b => {
        const bd = new Date(b.date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      })
      .reduce((s, b) => s + (b.total || 0), 0);
    return { label, value, current: i === 5 };
  });

  /* ── filtered list ── */
  const filtered = tab === 'all'
    ? bookings
    : bookings.filter(b => {
        if (tab === 'active')    return ['active','confirmed'].includes(b.status);
        if (tab === 'completed') return ['completed','paid'].includes(b.status);
        if (tab === 'cancelled') return b.status === 'cancelled';
        return true;
      });

  /* ── not logged in ── */
  if (!user) {
    return (
      <div className="page-bg pt-[60px] flex items-center justify-center min-h-screen">
        <div className="card-static p-12 text-center max-w-sm w-full mx-4 animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
            <FaLock className="text-violet-500 text-xl" />
          </div>
          <h2 className="text-[20px] font-extrabold text-gray-900 mb-2">Login Required</h2>
          <p className="text-[13px] text-gray-500 mb-7 leading-relaxed">
            Sign in to view your Dashboard, spending history, and booking analytics.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openLogin'))}
            id="dashboard-login-btn"
            className="w-full btn-primary py-3 text-[14px] rounded-xl mb-3"
          >
            Login to Continue
          </button>
          <Link
            to="/book"
            className="block w-full py-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 text-center hover:border-violet-300 hover:text-violet-700 transition-all duration-150"
          >
            Book as Guest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg pt-[60px]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <span className="badge mb-2">📊 My Dashboard</span>
            <h1 className="text-[34px] font-extrabold text-gray-900 tracking-tight leading-tight">
              Welcome back,{' '}
              <span className="gradient-text">{user.name || user.email?.split('@')[0]}</span> 👋
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">Here's a summary of your parking activity</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchBookings(user)}
              disabled={loading}
              title="Refresh bookings"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-violet-700 hover:border-violet-300 transition disabled:opacity-50"
            >
              <FaSync className={`text-[12px] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/book"
              className="btn-primary px-6 py-2.5 text-[13.5px] flex-shrink-0"
              id="dashboard-book-btn"
            >
              + Book a Slot
            </Link>
          </div>
        </div>

        {/* ── Top Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-up delay-1">
          {/* Total Spent */}
          <div className="card-static p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl icon-purple flex items-center justify-center shadow-sm">
                <FaRupeeSign className="text-white text-sm" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FaArrowUp className="text-[8px]" /> 12%
              </span>
            </div>
            <p className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none">₹{totalSpent}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Total Spent</p>
          </div>
          {/* Bookings */}
          <div className="card-static p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl icon-indigo flex items-center justify-center shadow-sm">
                <FaBookmark className="text-white text-sm" />
              </div>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                All time
              </span>
            </div>
            <p className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none">{totalBookings}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Total Bookings</p>
          </div>
          {/* Avg Spend */}
          <div className="card-static p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl icon-blue flex items-center justify-center shadow-sm">
                <FaChartBar className="text-white text-sm" />
              </div>
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                Per booking
              </span>
            </div>
            <p className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none">₹{avgSpend}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Average Spend</p>
          </div>
          {/* Active */}
          <div className="card-static p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl icon-green flex items-center justify-center shadow-sm">
                <FaClock className="text-white text-sm" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Now
              </span>
            </div>
            <p className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none">{activeCount}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Active Bookings</p>
          </div>
        </div>

        {/* ── Middle Row: Chart + Breakdown + Profile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-fade-up delay-2">

          {/* Monthly Spend Chart */}
          <div className="lg:col-span-2 card-static p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-bold text-gray-900">Monthly Spending</h2>
                <p className="text-[11px] text-gray-400">Last 6 months</p>
              </div>
              <span className="text-[11px] text-violet-600 font-semibold bg-violet-50 px-2.5 py-1 rounded-lg">
                ₹{monthData[5].value} this month
              </span>
            </div>
            {loading ? (
              <div className="h-16 animate-pulse bg-gray-100 rounded-xl" />
            ) : (
              <MiniBarChart data={monthData} />
            )}
          </div>

          {/* Booking Breakdown */}
          <div className="card-static p-6 flex flex-col items-center justify-center gap-4">
            <h2 className="text-[14px] font-bold text-gray-900 self-start">Booking Breakdown</h2>
            <DonutChart completed={completedCount} active={activeCount} cancelled={cancelledCount} />
            <div className="w-full space-y-2">
              {[
                { label: 'Completed', count: completedCount, color: 'bg-blue-500' },
                { label: 'Active',    count: activeCount,    color: 'bg-emerald-500' },
                { label: 'Cancelled', count: cancelledCount, color: 'bg-red-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Info Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-up delay-3">
          <div className="card-static p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl icon-amber flex items-center justify-center shadow-sm flex-shrink-0">
              <FaTrophy className="text-white text-sm" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Favourite Location</p>
              <p className="text-[13px] font-bold text-gray-800 truncate max-w-[160px]" title={favLocation}>{favLocation}</p>
            </div>
          </div>
          <div className="card-static p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl icon-purple flex items-center justify-center shadow-sm flex-shrink-0">
              <FaCarAlt className="text-white text-sm" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Primary Vehicle</p>
              <p className="text-[13px] font-bold font-mono text-gray-800">{bookings[0]?.vehicle || bookings[0]?.vehicle_number || '—'}</p>
            </div>
          </div>
          <div className="card-static p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl icon-blue flex items-center justify-center shadow-sm flex-shrink-0">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Account</p>
              <p className="text-[13px] font-bold text-gray-800 truncate max-w-[160px]" title={user.email}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* ── Booking History ── */}
        <div className="animate-fade-up delay-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-[16px] font-bold text-gray-900">Booking History</h2>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: 'all',       label: 'All' },
                { key: 'active',    label: '🟢 Active' },
                { key: 'completed', label: '🔵 Completed' },
                { key: 'cancelled', label: '🔴 Cancelled' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
                    tab === t.key
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card-static overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="w-9 h-9 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-[13px] text-gray-400">Loading your history...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-[14px] font-semibold text-gray-500">No {tab} bookings</p>
                <Link to="/book" className="text-[12px] text-violet-600 font-semibold mt-1 block hover:underline">
                  Book a slot →
                </Link>
              </div>
            ) : (
              filtered.map((b, i) => {
                const cfg = statusCfg[b.status] || statusCfg.completed;
                return (
                  <div
                    key={b._id || b.id || i}
                    className={`px-6 py-5 row-hover animate-fade-up ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                        >
                          📍
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <p className="font-semibold text-gray-900 text-[14px] truncate">{b.location}</p>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-400 mt-1">
                            Slot <span className="text-violet-600 font-mono font-semibold">{b.slot_id || b.slotId}</span>
                            {' · '}
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{b.vehicle || b.vehicle_number}</span>
                          </p>
                          <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-violet-400 text-[10px]" />
                              {b.date} · {b.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-blue-400 text-[10px]" />
                              {b.duration}h
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[22px] font-extrabold gradient-text tracking-tight leading-none">₹{b.total || b.amount}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">#{(b._id || b.id || '').slice(-6)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
