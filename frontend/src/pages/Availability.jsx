import { useState, useEffect } from 'react';
import SlotCard from '../Components/SlotCard';
import StatsCard from '../Components/StatsCard';
import { FaParking, FaCheckCircle, FaTimesCircle, FaSync, FaMapMarkerAlt, FaLayerGroup } from 'react-icons/fa';

const LOCATIONS = [
  'Downtown Parking Hub',
  'Airport Terminal A',
  'Mall Central Parking',
  'City Square',
  'Tech Park',
];

const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Basement'];

const generateSlots = (location = '', floor = '') => {
  const prices = [30, 40, 50, 60];
  const prefix = `${location.slice(0, 2).toUpperCase() || 'P'}-${floor.replace(/\D/g, '') || '1'}`;
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    slotId: `${prefix}-${String(i + 1).padStart(3, '0')}`,
    status: Math.random() > 0.45 ? 'available' : 'occupied',
    price: prices[Math.floor(Math.random() * prices.length)],
  }));
};

const Availability = () => {
  const [slots, setSlots]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [location, setLocation]       = useState(LOCATIONS[0]);
  const [floor, setFloor]             = useState(FLOORS[0]);

  const loadSlots = (loc = location, flr = floor) => {
    setLoading(true);
    setTimeout(() => {
      setSlots(generateSlots(loc, flr));
      setLoading(false);
    }, 600);
  };

  useEffect(() => { loadSlots(); }, []);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    loadSlots(e.target.value, floor);
  };

  const handleFloorChange = (e) => {
    setFloor(e.target.value);
    loadSlots(location, e.target.value);
  };

  const filtered       = slots.filter((s) => filter === 'all' || s.status === filter);
  const totalSlots     = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const occupiedSlots  = slots.filter((s) => s.status === 'occupied').length;

  return (
    <div className="page-bg pt-[60px]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          <span className="badge mb-3">🅿️ Live Parking Status</span>
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
            Slot <span className="gradient-text">Availability</span>
          </h1>
          <p className="text-gray-500 text-[14px] mt-2">
            Showing slots at{' '}
            <span className="text-violet-600 font-semibold">{location}</span>
            {' · '}
            <span className="text-violet-600 font-semibold">{floor}</span>
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatsCard icon={<FaParking />}     label="Total Slots"  value={totalSlots}     color="purple" />
          <StatsCard icon={<FaCheckCircle />} label="Available"    value={availableSlots} color="green"  />
          <StatsCard icon={<FaTimesCircle />} label="Occupied"     value={occupiedSlots}  color="red"    />
        </div>

        {/* Location & Floor Dropdowns */}
        <div className="card-static px-6 py-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Location */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-violet-400" />
                Location
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={handleLocationChange}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-[14px] font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition cursor-pointer hover:border-violet-300"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">▼</span>
              </div>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FaLayerGroup className="text-violet-400" />
                Floor
              </label>
              <div className="relative">
                <select
                  value={floor}
                  onChange={handleFloorChange}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-[14px] font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition cursor-pointer hover:border-violet-300"
                >
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="card-static px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[13px] text-gray-500">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Available ({availableSlots})
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              Occupied ({occupiedSlots})
            </span>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1.5">
            {['all', 'available', 'occupied'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-all duration-150 ${
                  filter === f
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
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-9 h-9 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400">Loading parking slots...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🅿️</p>
            <p className="text-[14px] font-semibold text-gray-500">No slots match the current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((slot, i) => (
              <div key={slot.id} className={`animate-fade-up`} style={{ animationDelay: `${i * 0.03}s` }}>
                <SlotCard slot={slot} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
