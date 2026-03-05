import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChevronDown,
  FaUser, FaLayerGroup, FaParking, FaCheckCircle, FaTimesCircle,
  FaSync, FaArrowLeft, FaArrowRight, FaRupeeSign, FaSearch,
} from 'react-icons/fa';
import StatsCard from '../Components/StatsCard';

/* ──────────────────── constants ──────────────────── */
const LOCATIONS = [
  'CityMall',
  'Downtown Parking Hub',
  'Airport Terminal A',
  'Airport Terminal B',
  'Mall Central Parking',
  'Tech Park Zone 1',
  'Railway Station Lot',
];
const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Basement'];
const DURATIONS = ['1', '2', '3', '4', '6', '8', '12', '24'];
const RATE_PER_HOUR = 40;

// Generate random prices as fallback
const defaultPrices = [30, 40, 50, 60];

/* ──────────────────── helpers ──────────────────── */
const SelectWrapper = ({ icon: Icon, children }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px] z-10 pointer-events-none" />
    )}
    {children}
    <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]" />
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
const BookSlot = () => {
  const navigate = useNavigate();

  /* ── step management ── */
  const [step, setStep] = useState(1); // 1 = form, 2 = availability

  /* ── form state ── */
  const [form, setForm] = useState({
    fullName: '',
    vehicleNumber: '',
    date: '',
    time: '',
    location: '',
    floor: 'Floor 1',
    duration: '',
  });

  /* ── availability state ── */
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const today = new Date().toISOString().split('T')[0];
  const totalAmount = form.duration ? parseInt(form.duration, 10) * RATE_PER_HOUR : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ── step 1 → 2 ── */
  const handleFindSlots = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('parkmate_booking', JSON.stringify({ ...form, totalAmount }));

    try {
      const floorNum = form.floor.replace(/\D/g, '') || 1;
      const res = await fetch(`/api/slots?floor=${floorNum}`);
      const data = await res.json();

      const formattedSlots = (data.slots || []).map(s => ({
        id: s._id || s.slot_id || s.slotId,
        slotId: s.slotId,
        status: s.status,
        price: s.pricePerHour || defaultPrices[Math.floor(Math.random() * defaultPrices.length)],
      }));
      setSlots(formattedSlots);
      setStep(2);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      // fallback handling could go here
    } finally {
      setLoading(false);
    }
  };

  /* ── refresh slots ── */
  const refreshSlots = async () => {
    setLoading(true);
    try {
      const floorNum = form.floor.replace(/\D/g, '') || 1;
      const res = await fetch(`/api/slots?floor=${floorNum}`);
      const data = await res.json();
      const formattedSlots = (data.slots || []).map(s => ({
        id: s._id || s.slot_id || s.slotId,
        slotId: s.slotId,
        status: s.status,
        price: s.pricePerHour || defaultPrices[Math.floor(Math.random() * defaultPrices.length)],
      }));
      setSlots(formattedSlots);
    } catch (err) {
      console.error("Failed to refresh slots:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── book a specific slot ── */
  const handleBookSlot = (slot) => {
    const booking = { ...form, totalAmount: slot.price * parseInt(form.duration || '1', 10), slotId: slot.slotId };
    localStorage.setItem('parkmate_booking', JSON.stringify(booking));
    localStorage.setItem('parkmate_selected_slot', JSON.stringify(slot));
    navigate('/payment');
  };

  /* ── derived ── */
  const filtered = slots.filter((s) => filter === 'all' || s.status === filter);
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const occupiedSlots = slots.filter((s) => s.status === 'occupied').length;

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="page-bg pt-[60px]">
      {/* Background blurs */}
      <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 bg-violet-300/20 rounded-full blur-[100px]" />
      <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-300/15 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 relative">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight">
            Book a <span className="gradient-text">Parking Slot</span>
          </h1>
          <p className="text-gray-500 text-[14px] mt-2 max-w-lg">
            {step === 1
              ? 'Fill in your details and find available parking slots in real time.'
              : <>Showing slots at <span className="text-violet-600 font-semibold">{form.location}</span> · <span className="text-violet-600 font-semibold">{form.floor}</span></>}
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-0 mb-8">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 ${step >= 1
                ? 'text-white shadow-md'
                : 'bg-gray-200 text-gray-500'
                }`}
              style={step >= 1 ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' } : {}}
            >
              {step > 1 ? <FaCheckCircle className="text-[14px]" /> : '1'}
            </div>
            <span className={`text-[13px] font-semibold ${step >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>
              Booking Details
            </span>
          </div>

          {/* Connector */}
          <div className="flex-1 mx-4 h-[2px] rounded-full overflow-hidden bg-gray-200">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: step >= 2 ? '100%' : '0%',
                background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
              }}
            />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 ${step >= 2
                ? 'text-white shadow-md'
                : 'bg-gray-200 text-gray-500'
                }`}
              style={step >= 2 ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' } : {}}
            >
              2
            </div>
            <span className={`text-[13px] font-semibold ${step >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>
              Choose Slot
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            STEP 1 — Booking Form
            ═══════════════════════════════════════════ */}
        {step === 1 && (
          <form onSubmit={handleFindSlots} className="card-static overflow-hidden animate-fade-up">
            {/* Gradient top bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)' }} />

            <div className="p-8 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[12px]" />
                  <input
                    type="text" name="fullName" value={form.fullName} onChange={handleChange}
                    placeholder="e.g., Rahul Sharma" required
                    className="input-field input-field-icon" id="booking-name-input"
                  />
                </div>
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Vehicle Number</label>
                <div className="relative">
                  <FaCar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
                  <input
                    type="text" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange}
                    placeholder="e.g., MH01AB1234" required
                    className="input-field input-field-icon uppercase font-mono tracking-wider" id="booking-vehicle-input"
                  />
                </div>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
                    <input
                      type="date" name="date" value={form.date} onChange={handleChange}
                      min={today} required
                      className="input-field input-field-icon cursor-pointer" id="booking-date-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Time</label>
                  <div className="relative">
                    <FaClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
                    <input
                      type="time" name="time" value={form.time} onChange={handleChange} required
                      className="input-field input-field-icon cursor-pointer" id="booking-time-input"
                    />
                  </div>
                </div>
              </div>

              {/* Location + Floor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Location</label>
                  <SelectWrapper icon={FaMapMarkerAlt}>
                    <select
                      name="location" value={form.location} onChange={handleChange} required
                      className="input-field input-field-icon pr-9 appearance-none cursor-pointer"
                      id="booking-location-select"
                    >
                      <option value="" disabled>Select Location</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Floor</label>
                  <SelectWrapper icon={FaLayerGroup}>
                    <select
                      name="floor" value={form.floor} onChange={handleChange} required
                      className="input-field input-field-icon pr-9 appearance-none cursor-pointer"
                      id="booking-floor-select"
                    >
                      {FLOORS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Duration (hours)</label>
                <SelectWrapper>
                  <select
                    name="duration" value={form.duration} onChange={handleChange} required
                    className="input-field pr-9 appearance-none cursor-pointer" id="booking-duration-select"
                  >
                    <option value="" disabled>Select Duration</option>
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>{d} hour{d !== '1' ? 's' : ''}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>

              {/* Total Amount */}
              <div
                className="flex items-center justify-center rounded-xl py-3.5 text-white text-[15px] font-bold tracking-wide"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)' }}
              >
                Estimated: ₹{totalAmount} ({form.duration || '0'} hr × ₹{RATE_PER_HOUR}/hr)
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading} id="booking-find-slots-btn"
                className="w-full btn-primary py-3.5 text-[14px] rounded-xl tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching Slots...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSearch className="text-[12px]" /> Find Available Slots
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════
            STEP 2 — Slot Availability Grid
            ═══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="animate-fade-up">

            {/* Booking Summary Bar */}
            <div className="card-static px-5 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-gray-600">
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-violet-500 text-[11px]" />
                  <span className="font-semibold text-gray-800">{form.fullName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCar className="text-violet-500 text-[11px]" />
                  <span className="font-mono font-semibold text-gray-800 uppercase">{form.vehicleNumber}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-violet-500 text-[11px]" />
                  <span className="font-semibold text-gray-800">{form.duration}hr · ₹{RATE_PER_HOUR}/hr</span>
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-[12px] font-bold text-violet-600 hover:text-violet-800 transition"
              >
                <FaArrowLeft className="text-[10px]" /> Edit Details
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatsCard icon={<FaParking />} label="Total Slots" value={totalSlots} color="purple" />
              <StatsCard icon={<FaCheckCircle />} label="Available" value={availableSlots} color="green" />
              <StatsCard icon={<FaTimesCircle />} label="Occupied" value={occupiedSlots} color="red" />
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
                  onClick={refreshSlots}
                  title="Refresh slots"
                  className="ml-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-violet-700 hover:border-violet-200 transition text-[13px]"
                >
                  <FaSync className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Slot Grid */}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filtered.map((slot, i) => {
                  const isAvailable = slot.status === 'available';
                  return (
                    <div
                      key={slot.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <div className={`p-4 flex flex-col gap-2.5 ${isAvailable ? 'slot-available' : 'slot-occupied'}`}>
                        {/* Top row */}
                        <div className="flex items-center justify-between">
                          <span className="text-base">🅿️</span>
                          <span
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable
                              ? 'bg-emerald-600/10 text-emerald-700'
                              : 'bg-red-600/10 text-red-700'
                              }`}
                          >
                            {isAvailable ? <FaCheckCircle className="text-[9px]" /> : <FaTimesCircle className="text-[9px]" />}
                            {isAvailable ? 'Open' : 'Taken'}
                          </span>
                        </div>

                        {/* Slot ID */}
                        <div>
                          <p className={`font-bold text-[15px] tracking-tight leading-none ${isAvailable ? 'text-emerald-800' : 'text-red-800'}`}>
                            {slot.slotId}
                          </p>
                          <p className={`text-[12px] mt-0.5 font-semibold flex items-center gap-0.5 ${isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                            <FaRupeeSign className="text-[10px]" />{slot.price}
                            <span className="font-normal opacity-70">/hr</span>
                          </p>
                        </div>

                        {/* Button */}
                        {isAvailable ? (
                          <button
                            onClick={() => handleBookSlot(slot)}
                            className="w-full mt-auto text-[12px] font-bold py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all duration-150 shadow-sm"
                          >
                            Book Now
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
        )}
      </div>
    </div>
  );
};

export default BookSlot;
