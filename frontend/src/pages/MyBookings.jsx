import { useState, useEffect } from 'react';
import StatsCard from '../Components/StatsCard';
import { FaBookmark, FaCheckCircle, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getBookings, cancelBooking } from '../services/api';

const statusCfg = {
  active: { cls: 'status-active', dot: 'bg-emerald-500', label: 'Active' },
  completed: { cls: 'status-completed', dot: 'bg-blue-500', label: 'Completed' },
  cancelled: { cls: 'status-cancelled', dot: 'bg-red-400', label: 'Cancelled' },
};

const MyBookings = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('parkmate_user') || localStorage.getItem('parkeasy_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getBookings();
        // API returns { bookings: [...] }
        const apiBookings = data.bookings || [];
        setBookings(apiBookings);
      } catch (err) {
        setError(err.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      // Refresh list after successful cancel
      const data = await getBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const total = bookings.length;
  const active = bookings.filter((b) => b.status === 'active').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;

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
          <StatsCard icon={<FaBookmark />} label="Total Bookings" value={total} color="purple" />
          <StatsCard icon={<FaClock />} label="Active" value={active} color="green" />
          <StatsCard icon={<FaCheckCircle />} label="Completed" value={completed} color="blue" />
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-900">Recent Bookings</h2>
            <span className="text-[12px] text-gray-400">{total} total</span>
          </div>

          {loading ? (
            <div className="card-static p-8 text-center text-[13px] text-gray-400">
              Loading your bookings...
            </div>
          ) : error ? (
            <div className="card-static p-8 text-center text-[13px] text-red-500">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card-static p-8 text-center text-[13px] text-gray-400">
              You don&apos;t have any bookings yet.
            </div>
          ) : (
            <div className="card-static overflow-hidden">
              {bookings.map((b, i) => {
                const cfg = statusCfg[b.status] || statusCfg.completed;
                const slotId = b.slotId || b.slot_id || 'N/A';
                const amount = typeof b.amount === 'number' ? b.amount : (b.totalAmount || '');
                const vehicle = b.vehicleNumber || b.vehicle || '—';
                const startedAt = b.entryTime || b.createdAt;

                return (
                  <div
                    key={b._id || b.id || i}
                    className={`px-6 py-5 row-hover animate-fade-up ${i < bookings.length - 1 ? 'border-b border-gray-100' : ''
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
                            <p className="font-semibold text-gray-900 text-[14px] truncate">
                              <FaMapMarkerAlt className="inline mr-1 text-violet-400 text-[11px]" />
                              {b.location || 'ParkMate Hub'}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-400 mt-1">
                            Slot{' '}
                            <span className="text-violet-600 font-mono font-semibold">{slotId}</span>
                            {' · '}
                            {amount !== '' && (
                              <>
                                <span className="font-semibold text-emerald-600">₹{amount}</span>
                                {' · '}
                              </>
                            )}
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                              {vehicle}
                            </span>
                          </p>
                          {startedAt && (
                            <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-violet-400 text-[10px]" />
                                {new Date(startedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="text-right flex-shrink-0">
                        {amount !== '' && (
                          <p className="text-[22px] font-extrabold gradient-text tracking-tight leading-none">
                            ₹{amount}
                          </p>
                        )}
                        {b._id && (
                          <p className="text-[10px] text-gray-400 font-mono mt-1">#{b._id}</p>
                        )}
                        {b.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleCancel(b._id)}
                            className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
