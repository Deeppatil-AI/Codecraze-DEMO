import { useState, useEffect } from 'react';
import StatsCard from '../Components/StatsCard';
import { FaBookmark, FaCheckCircle, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getBookings } from '../services/api';

const statusCfg = {
  active:    { cls: 'status-active',    dot: 'bg-emerald-500', label: 'Active'    },
  confirmed: { cls: 'status-active',   dot: 'bg-emerald-500', label: 'Confirmed' },
  paid:      { cls: 'status-completed', dot: 'bg-blue-500',   label: 'Paid'      },
  completed: { cls: 'status-completed', dot: 'bg-blue-500',    label: 'Completed' },
  cancelled: { cls: 'status-cancelled', dot: 'bg-red-400',     label: 'Cancelled' },
};

const MyBookings = () => {
  const [user, setUser]         = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('parkeasy_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      // Fetch real bookings from API
      setLoading(true);
      getBookings()
        .then((res) => {
          const allBookings = res.bookings || res || [];
          // Filter by user if user has _id
          const userBookings = parsed._id
            ? allBookings.filter((b) => b.user_id === parsed._id)
            : allBookings;
          setBookings(userBookings);
        })
        .catch((err) => {
          console.error('Failed to fetch bookings:', err);
          setBookings([]);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const total     = bookings.length;
  const active    = bookings.filter((b) => ['active', 'confirmed'].includes(b.status)).length;
  const completed = bookings.filter((b) => ['completed', 'paid'].includes(b.status)).length;

  /* ── Not logged in ── */
  if (!user) {
    return (
      <div className="page-bg pt-[60px] flex items-center justify-center min-h-screen">
        <div className="card-static p-12 text-center max-w-sm w-full mx-4 animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
            <FaLock className="text-violet-500 text-xl" />
          </div>
          <h2 className="text-[20px] font-extrabold text-gray-900 mb-2">Login Required</h2>
          <p className="text-[13px] text-gray-500 mb-7 leading-relaxed">
            Sign in to view your bookings and manage your parking history.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openLogin'))}
            id="bookings-login-btn"
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
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          {/* <span className="badge mb-3">📋 Dashboard</span> */}
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
            My <span className="gradient-text">Bookings</span>
          </h1>
          <p className="text-gray-500 text-[14px] mt-2">
            Welcome back, <span className="text-violet-600 font-semibold">{user.name}</span> 👋
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatsCard icon={<FaBookmark />}    label="Total Bookings"  value={total}     color="purple" />
          <StatsCard icon={<FaClock />}       label="Active"          value={active}    color="green"  />
          <StatsCard icon={<FaCheckCircle />} label="Completed"       value={completed} color="blue"   />
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-900">Recent Bookings</h2>
            <span className="text-[12px] text-gray-400">{total} total</span>
          </div>

          <div className="card-static overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="w-9 h-9 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-[13px] text-gray-400">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-[14px] font-semibold text-gray-500">No bookings yet</p>
                <p className="text-[12px] text-gray-400 mt-1">Book a parking slot to see it here.</p>
              </div>
            ) : (
            bookings.map((b, i) => {
              const cfg = statusCfg[b.status] || statusCfg.completed;
              return (
                <div
                  key={b._id || b.id || i}
                  className={`px-6 py-5 row-hover animate-fade-up ${
                    i < bookings.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                      >
                        📍
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <p className="font-semibold text-gray-900 text-[14px] truncate">{b.location}</p>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-400 mt-1">
                          Slot{' '}
                          <span className="text-violet-600 font-mono font-semibold">{b.slot_id || b.slotId}</span>
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

                    {/* Amount */}
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

export default MyBookings;
