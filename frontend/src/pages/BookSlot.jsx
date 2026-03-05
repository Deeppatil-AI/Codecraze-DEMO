import BookingForm from '../Components/BookingForm';

const tips = [
  { emoji: '⚡', text: 'Real-time updates every 60 seconds' },
  { emoji: '📱', text: 'Instant confirmation via SMS & email' },
  { emoji: '🔄', text: 'Free cancellation up to 30 mins before' },
  { emoji: '💳', text: 'Pay securely with card or UPI' },
];

const popularSpots = [
  { name: 'Downtown Parking Hub', slots: 14 },
  { name: 'Airport Terminal A', slots: 7 },
  { name: 'Mall Central Parking', slots: 22 },
];

const BookSlot = () => (
  <div className="page-bg pt-[60px]">
    {/* Background blurs */}
    <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 bg-violet-300/20 rounded-full blur-[100px]" />
    <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-300/15 rounded-full blur-[100px]" />

    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 relative">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <span className="badge mb-3">📅 Reserve Your Spot</span>
        <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
          Book a <span className="gradient-text">Parking Slot</span>
        </h1>
        <p className="text-gray-500 text-[14px] mt-2 max-w-md mx-auto">
          Fill in the details below and we'll find the best available spots in real time.
        </p>
      </div>

      <BookingForm />
    </div>
  </div>
);

export default BookSlot;
