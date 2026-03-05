import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../Components/StatsCard';
<<<<<<< HEAD
import { FaParking, FaCheckCircle, FaTimesCircle, FaSync, FaMapMarkerAlt, FaLayerGroup } from 'react-icons/fa';

const LOCATIONS = [
  'Downtown Parking Hub',
  'Airport Terminal A',
  'Mall Central Parking',
  'City Square',
  'Tech Park',
];

const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Basement'];

// Generate static prices and randomize locally if price isn't from DB
const defaultPrices = [30, 40, 50, 60];
=======
import {
  FaParking, FaCheckCircle, FaTimesCircle, FaSync,
  FaMapMarkerAlt, FaLayerGroup, FaRupeeSign, FaArrowRight,
  FaFilter, FaExclamationTriangle,
} from 'react-icons/fa';
import { getSlots, getLocations, getFloors } from '../services/api';
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1

/* ══════════════════════════════════════════════════
   AVAILABILITY PAGE — real-time data from DB, no mocks
   ══════════════════════════════════════════════════ */
const Availability = () => {
<<<<<<< HEAD
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);

  const loadSlots = async (loc = location, flr = floor) => {
    setLoading(true);
    try {
      // The backend API takes 'floor' as a query parameter (e.g., 1, 2, 3)
      // Since map UI is "Floor 1", "Floor 2", we extract that digit.
      const floorNum = flr.replace(/\D/g, '') || 1;
      const res = await fetch(`/api/slots?floor=${floorNum}`);
      const data = await res.json();

      // Ensure mapped correctly
      const formattedSlots = (data.slots || []).map(s => ({
        id: s._id || s.slot_id || s.slotId,
        slotId: s.slotId,
        status: s.status,
        price: s.pricePerHour || defaultPrices[Math.floor(Math.random() * defaultPrices.length)],
        floor: s.floor
      }));
      setSlots(formattedSlots);
    } catch (err) {
      console.error("Failed to load slots:", err);
      setSlots([]); // Fallback to empty
    } finally {
      setLoading(false);
    }
=======
  const navigate = useNavigate();

  /* ── state ── */
  const [slots, setSlots]             = useState([]);
  const [locations, setLocations]     = useState([]);
  const [floors, setFloors]           = useState([]);
  const [location, setLocation]       = useState('');
  const [floor, setFloor]             = useState('');
  const [filter, setFilter]           = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const [loadingLocs,  setLoadingLocs]  = useState(true);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError]               = useState('');

  /* ── 1. fetch locations from DB on mount ── */
  useEffect(() => {
    setLoadingLocs(true);
    setError('');
    getLocations()
      .then((res) => {
        const locs = res.locations || res || [];
        setLocations(locs);
        if (locs.length > 0) setLocation(locs[0]);
      })
      .catch(() => setError('Unable to reach the server. Please make sure the backend is running.'))
      .finally(() => setLoadingLocs(false));
  }, []);

  /* ── 2. fetch floors whenever location changes ── */
  useEffect(() => {
    if (!location) return;
    setLoadingFloors(true);
    setFloor('');
    setSlots([]);
    getFloors(location)
      .then((res) => {
        const flrs = res.floors || res || [];
        setFloors(flrs);
        if (flrs.length > 0) setFloor(flrs[0]);
      })
      .catch(() => setFloors([]))
      .finally(() => setLoadingFloors(false));
  }, [location]);

  /* ── 3. fetch slots whenever location OR floor is fully resolved ── */
  const loadSlots = useCallback(
    (loc = location, flr = floor) => {
      if (!loc || !flr) return;
      setLoadingSlots(true);
      setError('');
      const params = { location: loc, floor: flr };
      getSlots(params)
        .then((res) => {
          const raw = res.slots || res || [];
          const mapped = raw.map((s) => ({
            id:     s._id || s.id,
            slotId: s.slot_number || s.slotId || s._id,
            status: s.status,
            price:  s.price,
          }));
          setSlots(mapped);
        })
        .catch(() => {
          setSlots([]);
          setError('Failed to load slots. Please check your connection and try again.');
        })
        .finally(() => setLoadingSlots(false));
    },
    [location, floor]
  );

  useEffect(() => {
    if (location && floor) loadSlots(location, floor);
  }, [location, floor]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── handlers ── */
  const handleLocationChange = (e) => setLocation(e.target.value);
  const handleFloorChange    = (e) => {
    const v = e.target.value;
    setFloor(v);
    loadSlots(location, v);
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
  };

  const handleBookSlot = (slot) => {
    localStorage.setItem('parkmate_preselected_slot', JSON.stringify({
      ...slot,
      location,
      floor,
    }));
    navigate('/book');
  };

<<<<<<< HEAD
  const handleFloorChange = (e) => {
    setFloor(e.target.value);
    loadSlots(location, e.target.value);
  };

  const filtered = slots.filter((s) => filter === 'all' || s.status === filter);
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const occupiedSlots = slots.filter((s) => s.status === 'occupied').length;
=======
  /* ── derived data ── */
  const searched = searchQuery
    ? slots.filter((s) => s.slotId.toLowerCase().includes(searchQuery.toLowerCase()))
    : slots;
  const filtered       = searched.filter((s) => filter === 'all' || s.status === filter);
  const totalSlots     = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const occupiedSlots  = slots.filter((s) => s.status === 'occupied').length;
  const availPercent   = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1

  const isLoading = loadingLocs || loadingFloors || loadingSlots;

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="page-bg pt-[60px]">
      {/* Background blurs */}
      <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px]" />
      <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 bg-violet-300/15 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 relative">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Status
            </span>
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight">
            Check <span className="gradient-text">Availability</span>
          </h1>
          <p className="text-gray-500 text-[14px] mt-2 max-w-lg">
            Browse real-time parking slot availability across all locations. Find the
            perfect spot, then book it in seconds.
          </p>
        </div>

<<<<<<< HEAD
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatsCard icon={<FaParking />} label="Total Slots" value={totalSlots} color="purple" />
          <StatsCard icon={<FaCheckCircle />} label="Available" value={availableSlots} color="green" />
          <StatsCard icon={<FaTimesCircle />} label="Occupied" value={occupiedSlots} color="red" />
=======
        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 text-[13px] text-red-700">
            <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="text-red-500 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => { setError(''); loadSlots(); }}
              className="ml-auto text-red-400 hover:text-red-600 font-semibold text-[12px] underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={<FaParking />}     label="Total Slots"  value={totalSlots}     color="purple" />
          <StatsCard icon={<FaCheckCircle />} label="Available"    value={availableSlots} color="green"  />
          <StatsCard icon={<FaTimesCircle />} label="Occupied"     value={occupiedSlots}  color="red"    />
          <div className="card-static flex flex-col items-center justify-center py-4 px-3">
            <div className="relative w-12 h-12 mb-1.5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="url(#availGrad)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${availPercent * 0.88} 88`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="availGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-700">
                {availPercent}%
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500">Availability</p>
          </div>
>>>>>>> cd40eec0c57980619ee6661b0859d697544281e1
        </div>

        {/* ── Location & Floor Selectors ── */}
        <div className="card-static px-6 py-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Location */}
            <div>
              <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                <FaMapMarkerAlt className="text-violet-400" />
                Location
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={handleLocationChange}
                  id="availability-location-select"
                  disabled={loadingLocs}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-[14px] font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition cursor-pointer hover:border-violet-300 disabled:opacity-50"
                >
                  {loadingLocs ? (
                    <option>Loading locations…</option>
                  ) : locations.length === 0 ? (
                    <option>No locations found</option>
                  ) : (
                    locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))
                  )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">▼</span>
              </div>
            </div>

            {/* Floor */}
            <div>
              <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                <FaLayerGroup className="text-violet-400" />
                Floor
              </label>
              <div className="relative">
                <select
                  value={floor}
                  onChange={handleFloorChange}
                  id="availability-floor-select"
                  disabled={loadingFloors || floors.length === 0}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-[14px] font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition cursor-pointer hover:border-violet-300 disabled:opacity-50"
                >
                  {loadingFloors ? (
                    <option>Loading floors…</option>
                  ) : floors.length === 0 ? (
                    <option>No floors found</option>
                  ) : (
                    floors.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))
                  )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="card-static px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          {/* Left — Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-[12px] text-gray-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available ({availableSlots})
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                Occupied ({occupiedSlots})
              </span>
            </div>
          </div>

          {/* Right — Filter + Refresh */}
          <div className="flex items-center gap-1.5">
            <FaFilter className="text-gray-400 text-[10px] mr-1" />
            {['all', 'available', 'occupied'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-all duration-150 ${filter === f
                    ? 'text-white shadow-sm'
                    : 'text-gray-500 bg-white border border-gray-200 hover:text-violet-700 hover:border-violet-200'
                  }`}
                style={filter === f ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' } : {}}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => loadSlots()}
              title="Refresh slots"
              className="ml-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-violet-700 hover:border-violet-200 transition text-[13px]"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Slot Grid ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-9 h-9 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400">Loading parking slots…</p>
          </div>
        ) : filtered.length === 0 && !error ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🅿️</p>
            <p className="text-[14px] font-semibold text-gray-500">
              {slots.length === 0
                ? 'No slots found for this location and floor.'
                : 'No slots match the current filter.'}
            </p>
            {slots.length > 0 && (
              <button
                onClick={() => { setFilter('all'); setSearchQuery(''); }}
                className="mt-3 text-[13px] text-violet-600 font-semibold hover:text-violet-800 underline underline-offset-2 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filtered.map((slot, i) => {
              const isAvailable = slot.status === 'available';
              const isHovered   = hoveredSlot === slot.id;
              return (
                <div
                  key={slot.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onMouseEnter={() => setHoveredSlot(slot.id)}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  <div
                    className={`relative p-4 flex flex-col gap-2.5 transition-all duration-200 ${
                      isAvailable ? 'slot-available' : 'slot-occupied'
                    } ${isAvailable && isHovered ? 'scale-[1.02] shadow-lg' : ''}`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <span className="text-base">🅿️</span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-600/10 text-emerald-700'
                            : 'bg-red-600/10 text-red-700'
                        }`}
                      >
                        {isAvailable ? <FaCheckCircle className="text-[9px]" /> : <FaTimesCircle className="text-[9px]" />}
                        {isAvailable ? 'Open' : 'Taken'}
                      </span>
                    </div>

                    {/* Slot ID + Price */}
                    <div>
                      <p className={`font-bold text-[15px] tracking-tight leading-none ${isAvailable ? 'text-emerald-800' : 'text-red-800'}`}>
                        {slot.slotId}
                      </p>
                      <p className={`text-[12px] mt-0.5 font-semibold flex items-center gap-0.5 ${isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                        <FaRupeeSign className="text-[10px]" />{slot.price}
                        <span className="font-normal opacity-70">/hr</span>
                      </p>
                    </div>

                    {/* Action */}
                    {isAvailable ? (
                      <button
                        onClick={() => handleBookSlot(slot)}
                        className="w-full mt-auto text-[12px] font-bold py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all duration-150 shadow-sm flex items-center justify-center gap-1.5"
                      >
                        Book This Slot <FaArrowRight className="text-[10px]" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full mt-auto text-[12px] font-semibold py-1.5 rounded-lg bg-red-200/60 text-red-400 cursor-not-allowed"
                      >
                        Occupied
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
