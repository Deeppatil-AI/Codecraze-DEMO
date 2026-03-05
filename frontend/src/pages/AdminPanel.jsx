import { useState, useEffect, useCallback } from 'react';
import {
  FaUsers, FaBookmark, FaRupeeSign, FaCarAlt, FaParking,
  FaCheckCircle, FaBan, FaClock, FaChartBar, FaSearch,
  FaShieldAlt, FaArrowUp, FaEye, FaSignOutAlt, FaSync,
} from 'react-icons/fa';
import { getBookings, getAdminStats, getAdminUsers } from '../services/api';

/* ── status config ─────────────────────────────────────────────── */
const statusCfg = {
  active:    { cls: 'status-active',    dot: 'bg-emerald-500', label: 'Active'    },
  confirmed: { cls: 'status-active',    dot: 'bg-emerald-500', label: 'Confirmed' },
  paid:      { cls: 'status-completed', dot: 'bg-blue-500',    label: 'Paid'      },
  completed: { cls: 'status-completed', dot: 'bg-blue-500',    label: 'Completed' },
  cancelled: { cls: 'status-cancelled', dot: 'bg-red-400',     label: 'Cancelled' },
};

/* ── tiny sparkline bar ───────────────────────────────────────── */
const Sparkline = ({ values }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${Math.max(3, (v / max) * 30)}px`,
            background: i === values.length - 1
              ? 'linear-gradient(to top, #7c3aed, #8b5cf6)'
              : '#ddd6fe',
            opacity: 0.7 + (i / values.length) * 0.3,
          }}
        />
      ))}
    </div>
  );
};

/* ── loading skeleton row ─────────────────────────────────────── */
const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
      </td>
    ))}
  </tr>
);

/* ═══════════════════════════════════════════════════════════════ */
const AdminPanel = ({ user, onLogout }) => {
  const [bookings, setBookings]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [loadingB, setLoadingB]   = useState(true);
  const [loadingU, setLoadingU]   = useState(true);
  const [loadingS, setLoadingS]   = useState(true);
  const [section, setSection]     = useState('overview');
  const [search, setSearch]       = useState('');

  /* ── fetch all data ── */
  const fetchAll = useCallback(() => {
    // Bookings
    setLoadingB(true);
    getBookings()
      .then(res => setBookings(res.bookings || res || []))
      .catch(() => setBookings([]))
      .finally(() => setLoadingB(false));

    // Admin stats
    setLoadingS(true);
    getAdminStats()
      .then(res => setStats(res))
      .catch(() => setStats(null))
      .finally(() => setLoadingS(false));

    // Users
    setLoadingU(true);
    getAdminUsers()
      .then(res => setUsers(res.users || res || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingU(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── derived from stats (with live bookings fallback) ── */
  const totalRevenue   = stats?.total_revenue   ?? bookings.reduce((s, b) => s + (b.total || 0), 0);
  const totalBookings  = stats?.total_bookings  ?? bookings.length;
  const activeCount    = stats?.active_count    ?? bookings.filter(b => ['active','confirmed'].includes(b.status)).length;
  const completedCount = stats?.completed_count ?? bookings.filter(b => ['completed','paid'].includes(b.status)).length;
  const cancelledCount = stats?.cancelled_count ?? bookings.filter(b => b.status === 'cancelled').length;
  const totalSlots     = stats?.total_slots     ?? 0;
  const availableSlots = stats?.available_slots ?? 0;
  const totalUsers     = stats?.total_users     ?? users.length;
  const topLocations   = stats?.top_locations   ?? [];

  // Sparkline: last 6 monthly values from stats, or zeros
  const sparkValues = stats?.monthly_revenue?.map(m => m.value) ?? [0, 0, 0, 0, 0, totalRevenue];

  /* ── filtered bookings ── */
  const filteredBookings = bookings.filter(b => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.location?.toLowerCase().includes(q) ||
      b.full_name?.toLowerCase().includes(q) ||
      b.user_name?.toLowerCase().includes(q) ||
      b.vehicle?.toLowerCase().includes(q) ||
      (b.slot_id || b.slotId)?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const navItems = [
    { key: 'overview',  icon: <FaChartBar />,  label: 'Overview'  },
    { key: 'bookings',  icon: <FaBookmark />,  label: 'Bookings'  },
    { key: 'users',     icon: <FaUsers />,     label: 'Users'     },
    { key: 'slots',     icon: <FaParking />,   label: 'Slots'     },
  ];

  /* ── slot visual map — driven by real slots from bookings ── */
  const slotRows = ['A', 'B', 'C', 'D'];
  const slotCols = [1, 2, 3, 4];
  const occupiedSlotIds = new Set(
    bookings
      .filter(b => ['active', 'confirmed'].includes(b.status))
      .map(b => b.slot_id || b.slotId)
  );

  return (
    <div className="page-bg min-h-screen">
      {/* ── Admin Top Nav Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-900 flex items-center justify-center shadow-sm">
              <FaShieldAlt className="text-white text-sm" />
            </div>
            <div>
              <span className="text-[16px] font-extrabold text-gray-900 tracking-tight">ParkMate</span>
              <span className="ml-2 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </span>
            <button
              onClick={fetchAll}
              title="Refresh data"
              className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 transition"
            >
              <FaSync className={`text-[12px] ${(loadingB || loadingS || loadingU) ? 'animate-spin' : ''}`} />
            </button>
            <span className="hidden sm:block text-[11px] text-gray-400 font-mono">{user?.email}</span>
            <button
              onClick={onLogout}
              id="admin-logout-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-150"
            >
              <FaSignOutAlt className="text-[10px]" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-1 w-44 flex-shrink-0">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 text-left ${
                  section === item.key
                    ? 'bg-violet-100 text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="text-[12px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </aside>

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-full">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                  section === item.key ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden xs:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* ══ OVERVIEW ══ */}
            {section === 'overview' && (
              <div className="animate-fade-up space-y-5">

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue */}
                  <div className="card-static p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl icon-purple flex items-center justify-center shadow-sm">
                        <FaRupeeSign className="text-white text-xs" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <FaArrowUp className="text-[7px]" /> Live
                      </span>
                    </div>
                    {loadingS ? (
                      <div className="h-6 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-[24px] font-extrabold text-gray-900 tracking-tight leading-none">₹{totalRevenue}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">Total Revenue</p>
                    <div className="mt-3">
                      <Sparkline values={sparkValues} />
                    </div>
                  </div>

                  {/* Bookings */}
                  <div className="card-static p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl icon-indigo flex items-center justify-center shadow-sm">
                        <FaBookmark className="text-white text-xs" />
                      </div>
                    </div>
                    {loadingB ? (
                      <div className="h-6 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-[24px] font-extrabold text-gray-900 tracking-tight leading-none">{totalBookings}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">Total Bookings</p>
                    <div className="flex gap-1 mt-3 text-[9px] font-semibold">
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{activeCount} active</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">{completedCount} done</span>
                    </div>
                  </div>

                  {/* Users */}
                  <div className="card-static p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl icon-blue flex items-center justify-center shadow-sm">
                        <FaUsers className="text-white text-xs" />
                      </div>
                    </div>
                    {loadingU ? (
                      <div className="h-6 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-[24px] font-extrabold text-gray-900 tracking-tight leading-none">{totalUsers}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">Registered Users</p>
                    <p className="text-[10px] text-violet-600 font-semibold mt-3 bg-violet-50 px-1.5 py-0.5 rounded-full inline-block">
                      {users.filter(u => u.status === 'active').length} active
                    </p>
                  </div>

                  {/* Slots */}
                  <div className="card-static p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl icon-green flex items-center justify-center shadow-sm">
                        <FaParking className="text-white text-xs" />
                      </div>
                    </div>
                    {loadingS ? (
                      <div className="h-6 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-[24px] font-extrabold text-gray-900 tracking-tight leading-none">{totalSlots}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">Total Slots</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-3 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-block">
                      {availableSlots} available
                    </p>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="card-static overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[14px] font-bold text-gray-900">Recent Bookings</h2>
                    <button
                      onClick={() => setSection('bookings')}
                      className="text-[11px] text-violet-600 font-semibold hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                  {loadingB ? (
                    <div className="divide-y divide-gray-50">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="px-5 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
                            <div className="h-2.5 bg-gray-100 rounded animate-pulse w-28" />
                          </div>
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-14" />
                        </div>
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-[13px]">No bookings yet.</div>
                  ) : (
                    bookings.slice(0, 5).map((b, i) => {
                      const cfg = statusCfg[b.status] || statusCfg.completed;
                      return (
                        <div key={b._id} className={`px-5 py-4 row-hover flex items-center justify-between gap-3 ${i < 4 ? 'border-b border-gray-50' : ''}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl icon-purple flex items-center justify-center flex-shrink-0 text-sm">📍</div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800 truncate">{b.location}</p>
                              <p className="text-[11px] text-gray-400">{b.full_name || b.user_name || '—'} · {b.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                            <p className="text-[14px] font-extrabold gradient-text">₹{b.total}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Top Locations by Revenue */}
                <div className="card-static p-5">
                  <h2 className="text-[14px] font-bold text-gray-900 mb-4">Top Locations by Revenue</h2>
                  {loadingS ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-2.5 w-4 bg-gray-100 rounded animate-pulse" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/4" />
                            <div className="h-1.5 bg-gray-100 rounded-full animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topLocations.length === 0 ? (
                    <p className="text-gray-400 text-[13px]">No data yet.</p>
                  ) : (() => {
                    const maxRev = Math.max(...topLocations.map(l => l.revenue), 1);
                    return topLocations.map((loc, i) => (
                      <div key={loc.name} className="flex items-center gap-3 mb-3 last:mb-0">
                        <span className="text-[11px] text-gray-400 font-mono w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[12px] font-semibold text-gray-700 truncate">{loc.name}</span>
                            <span className="text-[12px] font-bold text-gray-900 ml-2">₹{loc.revenue}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.round((loc.revenue / maxRev) * 100)}%`,
                                background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* ══ BOOKINGS ══ */}
            {section === 'bookings' && (
              <div className="animate-fade-up space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                    <input
                      type="text"
                      placeholder="Search by location, name, vehicle, slot..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="input-field input-field-icon text-[13px]"
                      id="admin-booking-search"
                    />
                  </div>
                </div>

                <div className="card-static overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[14px] font-bold text-gray-900">All Bookings</h2>
                    <span className="text-[11px] text-gray-400">{filteredBookings.length} results</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          {['ID', 'Name', 'Location', 'Slot', 'Vehicle', 'Date', 'Duration', 'Amount', 'Status'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loadingB ? (
                          [1,2,3,4,5].map(i => <SkeletonRow key={i} cols={9} />)
                        ) : filteredBookings.length === 0 ? (
                          <tr><td colSpan={9} className="text-center py-12 text-gray-400">No bookings found.</td></tr>
                        ) : filteredBookings.map((b, i) => {
                          const cfg = statusCfg[b.status] || statusCfg.completed;
                          return (
                            <tr key={b._id || i} className="border-b border-gray-50 row-hover">
                              <td className="px-4 py-3 font-mono text-gray-400">#{(b._id || '').slice(-6)}</td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-gray-800 whitespace-nowrap">{b.full_name || b.user_name || '—'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-gray-700 font-medium whitespace-nowrap">{b.location}</p>
                              </td>
                              <td className="px-4 py-3 font-mono text-violet-600 font-semibold">{b.slot_id || b.slotId}</td>
                              <td className="px-4 py-3 font-mono text-gray-500">{b.vehicle || b.vehicle_number}</td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{b.date} {b.time}</td>
                              <td className="px-4 py-3 text-gray-500">{b.duration}h</td>
                              <td className="px-4 py-3 font-bold gradient-text">₹{b.total || b.amount}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.cls}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                  {cfg.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══ USERS ══ */}
            {section === 'users' && (
              <div className="animate-fade-up space-y-4">
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field input-field-icon text-[13px]"
                    id="admin-user-search"
                  />
                </div>

                <div className="card-static overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[14px] font-bold text-gray-900">Registered Users</h2>
                    <span className="text-[11px] text-gray-400">{filteredUsers.length} users</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          {['User', 'Email', 'Bookings', 'Total Spent', 'Joined', 'Status'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loadingU ? (
                          [1,2,3,4].map(i => <SkeletonRow key={i} cols={6} />)
                        ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found.</td></tr>
                        ) : filteredUsers.map((u) => (
                          <tr key={u._id} className="border-b border-gray-50 row-hover">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl icon-purple flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white">
                                  {(u.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-800 whitespace-nowrap">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                            <td className="px-4 py-3 font-bold text-gray-800">{u.bookings ?? 0}</td>
                            <td className="px-4 py-3 font-bold gradient-text">₹{u.spent ?? 0}</td>
                            <td className="px-4 py-3 text-gray-400">{u.joined || u.created_at?.slice(0, 10) || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {u.status === 'active' ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══ SLOTS ══ */}
            {section === 'slots' && (
              <div className="animate-fade-up space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Slots',     val: loadingS ? '…' : totalSlots,                    icon: <FaParking />,      color: 'icon-purple' },
                    { label: 'Available',        val: loadingS ? '…' : (stats?.available_slots ?? 0), icon: <FaCheckCircle />,  color: 'icon-green' },
                    { label: 'Occupied',         val: loadingS ? '…' : (stats?.occupied_slots  ?? 0), icon: <FaCarAlt />,       color: 'icon-indigo' },
                    { label: 'Cancelled Bookings',val: loadingB ? '…' : cancelledCount,               icon: <FaBan />,          color: 'icon-red' },
                  ].map(s => (
                    <div key={s.label} className="card-static p-4">
                      <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-white text-xs shadow-sm mb-3`}>
                        {s.icon}
                      </div>
                      <p className="text-[22px] font-extrabold text-gray-900">{s.val}</p>
                      <p className="text-[11px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Live slot map from real booking data */}
                <div className="card-static p-5">
                  <h2 className="text-[14px] font-bold text-gray-900 mb-1">Live Slot Map</h2>
                  <p className="text-[11px] text-gray-400 mb-4">Slots occupied = bookings with active/confirmed status</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {slotRows.flatMap(row =>
                      slotCols.map(col => {
                        const slotId = `${row}${col}`;
                        const occupied = occupiedSlotIds.has(slotId);
                        return (
                          <div
                            key={slotId}
                            className={`p-2 rounded-xl text-center text-[10px] font-bold transition-all duration-200 cursor-default ${
                              occupied ? 'slot-occupied text-red-700' : 'slot-available text-emerald-700'
                            }`}
                            title={`Slot ${slotId}: ${occupied ? 'Occupied' : 'Available'}`}
                          >
                            <div className="text-[14px] mb-0.5">{occupied ? '🚗' : '🅿️'}</div>
                            {slotId}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300 inline-block" />
                      Available
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="w-3 h-3 rounded bg-red-200 border border-red-300 inline-block" />
                      Occupied
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
