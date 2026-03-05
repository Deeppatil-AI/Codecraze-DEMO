import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentForm from '../Components/PaymentForm';
import { FaParking, FaClock, FaRupeeSign, FaMapMarkerAlt, FaCar, FaShieldAlt } from 'react-icons/fa';

const Payment = () => {
  const [slot, setSlot] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem('parkmate_selected_slot');
    const b = localStorage.getItem('parkmate_booking');

    if (s && b) {
      setSlot(JSON.parse(s));
      setBooking(JSON.parse(b));
    } else {
      setSlot(null);
      setBooking(null);
    }
  }, []);

  const duration = booking?.duration || 0;
  const pricePerHr = slot?.price || 0;
  const totalPrice = duration && pricePerHr ? duration * pricePerHr : 0;

  const rows = [
    { Icon: FaParking, bg: 'bg-violet-100', color: 'text-violet-600', label: 'Slot Number', value: slot?.slotId || 'P-001' },
    { Icon: FaMapMarkerAlt, bg: 'bg-blue-100', color: 'text-blue-600', label: 'Location', value: booking?.location || 'Downtown Parking Hub' },
    { Icon: FaClock, bg: 'bg-indigo-100', color: 'text-indigo-600', label: 'Duration', value: `${duration} hour${duration > 1 ? 's' : ''}` },
    { Icon: FaRupeeSign, bg: 'bg-emerald-100', color: 'text-emerald-600', label: 'Rate', value: `₹${pricePerHr} / hour` },
  ];

  return (
    <div className="page-bg pt-[60px]">
      <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 bg-violet-200/25 rounded-full blur-[100px]" />
      <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-200/15 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 relative">
        {/* Header */}
        <div className="mb-8">
          {/* <span className="badge mb-3">💳 Almost There</span> */}
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
            Confirm <span className="gradient-text">Payment</span>
          </h1>
          <p className="text-gray-500 text-[14px] mt-2">Review your booking and complete the payment below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card-static p-6">
              <p className="text-[13px] font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">
                📋 Booking Summary
              </p>

              {!slot || !booking ? (
                <div className="py-6 text-center text-[13px] text-gray-400">
                  No booking selected yet.{' '}
                  <Link to="/book" className="text-violet-600 font-semibold hover:text-violet-800">
                    Book a slot first
                  </Link>
                  .
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {rows.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${r.bg} flex items-center justify-center flex-shrink-0`}>
                          <r.Icon className={`${r.color} text-[13px]`} />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-medium leading-none mb-0.5">{r.label}</p>
                          <p className="text-[13px] text-gray-800 font-semibold leading-snug">{r.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="divider" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-gray-400 font-medium">Total Amount</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Incl. taxes & fees</p>
                    </div>
                    <p className="text-[30px] font-extrabold gradient-text tracking-tight">₹{totalPrice}</p>
                  </div>
                </>
              )}
            </div>

            {/* Vehicle */}
            {booking?.vehicleNumber && (
              <div className="card-static px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FaCar className="text-violet-600 text-sm" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Vehicle</p>
                  <p className="text-[13px] font-mono font-bold text-gray-800 tracking-wider">
                    {booking.vehicleNumber}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <PaymentForm booking={booking} amount={totalPrice} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
