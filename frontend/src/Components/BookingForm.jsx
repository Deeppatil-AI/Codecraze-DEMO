import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock,
  FaChevronDown, FaUser, FaLayerGroup, FaParking,
} from 'react-icons/fa';

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

const RATE_PER_HOUR = 40; // ₹ per hour

const generateSlots = () =>
  ['A', 'B', 'C'].flatMap((row) => [1, 2, 3, 4].map((col) => `${row}${col}`));


const DURATIONS = ['1', '2', '3', '4', '6', '8', '12', '24'];

const SelectWrapper = ({ icon: Icon, children }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px] z-10 pointer-events-none" />
    )}
    {children}
    <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]" />
  </div>
);

const BookingForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    vehicleNumber: '',
    date: '',
    time: '',
    location: '',
    floor: 'Floor 1',
    duration: '',
    slot: '',
  });
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState(generateSlots());

  const today = new Date().toISOString().split('T')[0];

  const totalAmount =
    form.duration && form.slot ? parseInt(form.duration, 10) * RATE_PER_HOUR : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'floor') {
      updated.slot = '';
    }
    setForm(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('parkmate_booking', JSON.stringify({ ...form, totalAmount }));
    setTimeout(() => {
      setLoading(false);
      navigate('/book');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="card-static overflow-hidden">
      {/* Gradient top bar */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)' }}
      />

      <div className="p-8 space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[12px]" />
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g., Rahul Sharma"
              required
              className="input-field input-field-icon"
              id="booking-name-input"
            />
          </div>
        </div>

        {/* Vehicle Number */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            Vehicle Number
          </label>
          <div className="relative">
            <FaCar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
            <input
              type="text"
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              placeholder="e.g., MH01AB1234"
              required
              className="input-field input-field-icon uppercase font-mono tracking-wider"
              id="booking-vehicle-input"
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
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={today}
                required
                className="input-field input-field-icon cursor-pointer"
                id="booking-date-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Time</label>
            <div className="relative">
              <FaClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="input-field input-field-icon cursor-pointer"
                id="booking-time-input"
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
                name="location"
                value={form.location}
                onChange={handleChange}
                required
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
                name="floor"
                value={form.floor}
                onChange={handleChange}
                required
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

        {/* Duration + Parking Slot */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Duration (hours)
            </label>
            <SelectWrapper>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                className="input-field pr-9 appearance-none cursor-pointer"
                id="booking-duration-select"
              >
                <option value="" disabled>Select Duration</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d} hour{d !== '1' ? 's' : ''}</option>
                ))}
              </select>
            </SelectWrapper>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Parking Slot
            </label>
            <SelectWrapper icon={FaParking}>
              <select
                name="slot"
                value={form.slot}
                onChange={handleChange}
                required
                className="input-field input-field-icon pr-9 appearance-none cursor-pointer"
                id="booking-slot-select"
              >
                <option value="" disabled>Select Slot</option>
                {slots.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>

        {/* Total Amount */}
        <div
          className="flex items-center justify-center rounded-xl py-3.5 text-white text-[15px] font-bold tracking-wide"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)' }}
        >
          Total Amount: ₹{totalAmount}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          id="booking-submit-btn"
          className="w-full btn-primary py-3.5 text-[14px] rounded-xl tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            'BOOK SLOT'
          )}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
