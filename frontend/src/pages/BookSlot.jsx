import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChevronDown,
  FaUser, FaLayerGroup, FaParking, FaCheckCircle,
  FaArrowRight, FaRupeeSign, FaEye, FaTimes,
} from 'react-icons/fa';
import { bookSlot } from '../services/api';

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
const DURATIONS = ['0.5', '1', '1.5', '2', '2.5', '3', '4', '6', '8', '12', '24'];
const RATE_PER_HOUR = 40;

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
   BOOK SLOT PAGE — Dedicated booking form
   ══════════════════════════════════════════════════ */
const BookSlot = () => {
  const navigate = useNavigate();

  /* ── pre-selected slot from Availability page ── */
  const [preselected, setPreselected] = useState(null);

  /* ── form state ── */
  const [form, setForm] = useState({
    fullName: '',
    vehicleNumber: '',
    date: '',
    time: '',
    location: '',
    floor: 'Floor 1',
    duration: '',
    slotId: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const totalAmount = form.duration ? parseFloat(form.duration) * (preselected?.price || RATE_PER_HOUR) : 0;

  /* ── Check for pre-selected slot on mount ── */
  useEffect(() => {
    const stored = localStorage.getItem('parkmate_preselected_slot');
    if (stored) {
      try {
        const slot = JSON.parse(stored);
        setPreselected(slot);
        setForm((prev) => ({
          ...prev,
          location: slot.location || prev.location,
          floor: slot.floor || prev.floor,
          slotId: slot.slotId || '',
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearPreselected = () => {
    setPreselected(null);
    setForm((prev) => ({ ...prev, slotId: '' }));
    localStorage.removeItem('parkmate_preselected_slot');
  };

  /* ── submit booking ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Construct the booking info to pass to the payment page
    const bookingInfo = {
      ...form,
      totalAmount,
      // Ensure we have the latest slot info from preselected if available
      slotId: preselected?.slotId || form.slotId,
      vehicleNumber: form.vehicleNumber,
    };

    // Store booking info for payment page
    localStorage.setItem('parkmate_booking', JSON.stringify(bookingInfo));
    if (preselected) {
      localStorage.setItem('parkmate_selected_slot', JSON.stringify(preselected));
    }
    localStorage.removeItem('parkmate_preselected_slot');

    // Redirect to payment immediately
    setTimeout(() => {
      setSubmitting(false);
      navigate('/payment');
    }, 600);
  };

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="page-bg pt-[60px]">
      {/* Background blurs */}
      <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 bg-violet-300/20 rounded-full blur-[100px]" />
      <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-300/15 rounded-full blur-[100px]" />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 relative">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight">
            Book a <span className="gradient-text">Parking Slot</span>
          </h1>
          <p className="text-gray-500 text-[14px] mt-2 max-w-lg">
            Fill in your details below and proceed to payment. Need to check what's available first?{' '}
            <Link to="/availability" className="text-violet-600 font-semibold hover:text-violet-800 underline underline-offset-2 transition">
              View Availability →
            </Link>
          </p>
        </div>

        {/* ── Pre-selected Slot Banner ── */}
        {preselected && (
          <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3 bg-violet-50 border border-violet-200">
            <div className="flex items-center gap-2 text-[13px] text-violet-700 font-semibold">
              <FaParking className="text-violet-500" />
              Pre-selected: Slot {preselected.slotId} — {preselected.location} · {preselected.floor}
            </div>
            <button
              onClick={clearPreselected}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Remove selected slot"
            >
              <FaTimes className="text-[11px]" />
            </button>
          </div>
        )}

        {/* ── Booking Form ── */}
        <form onSubmit={handleSubmit} className="card-static overflow-hidden animate-fade-up">
          {/* Gradient top bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)' }} />

          <div className="p-8 space-y-5">

            {/* ─ Section: Personal Info ─ */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <FaUser className="text-violet-400" /> Personal Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* ─ Section: Schedule ─ */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <FaCalendarAlt className="text-violet-400" /> Schedule
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date */}
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
                {/* Time */}
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
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* ─ Section: Location ─ */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-violet-400" /> Parking Location
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
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
                {/* Floor */}
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
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* ── Total Amount ── */}
            <div
              className="flex items-center justify-between rounded-xl px-5 py-4 text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)' }}
            >
              <div>
                <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest">Estimated Total</p>
                <p className="text-[22px] font-extrabold tracking-tight mt-0.5">
                  ₹{totalAmount}
                </p>
              </div>
              <div className="text-right text-[12px] text-white/80">
                <p>{form.duration || '0'} hr × ₹{preselected?.price || RATE_PER_HOUR}/hr</p>
                {preselected && (
                  <p className="text-[11px] mt-0.5 text-white/60">Slot {preselected.slotId}</p>
                )}
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={submitting}
              id="booking-submit-btn"
              className="w-full btn-primary py-3.5 text-[14px] rounded-xl tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Proceed to Payment <FaArrowRight className="text-[12px]" />
                </span>
              )}
            </button>

            {/* ── Quick link to availability ── */}
            <div className="text-center">
              <Link
                to="/availability"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-600 hover:text-violet-800 transition"
              >
                <FaEye className="text-[11px]" />
                View Available Slots First
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookSlot;
