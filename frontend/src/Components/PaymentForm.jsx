import { useState } from 'react';
import { FaCreditCard, FaMobileAlt, FaLock, FaCheckCircle } from 'react-icons/fa';

const PhonePeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268c-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243C1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82c.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z" />
  </svg>
);

const GooglePayIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.93 9a1.84 1.84 0 0 0-1.28-.5h-2v5.74h.75V11.9h1.2a1.85 1.85 0 0 0 1.28-.5 1.63 1.63 0 0 0 .52-1.23A1.58 1.58 0 0 0 13.93 9m-.5 1.9a1 1 0 0 1-.73.3h-1.25v-2h1.25a.9.9 0 0 1 .73.3 1 1 0 0 1 0 1.38zm2.75-.72a1.92 1.92 0 0 0-1.63.77l.65.4a1.09 1.09 0 0 1 1-.52 1.1 1.1 0 0 1 .72.27.81.81 0 0 1 .3.65v.18a1.9 1.9 0 0 0-1.07-.25 1.9 1.9 0 0 0-1.25.32 1.2 1.2 0 0 0-.45 1 1.35 1.35 0 0 0 .45 1 1.74 1.74 0 0 0 1.1.37 1.45 1.45 0 0 0 1.23-.67v.54H18v-2.41a1.56 1.56 0 0 0-.47-1.2 1.84 1.84 0 0 0-1.35-.45m.7 3.17a1.18 1.18 0 0 1-.83.35.94.94 0 0 1-.57-.2.56.56 0 0 1-.25-.47.6.6 0 0 1 .3-.53 1.2 1.2 0 0 1 .75-.22 1.58 1.58 0 0 1 1 .27 1 1 0 0 1-.4.8M22 10.33v-.03l-.01.03zm-1.92 2.82h-.03l-1.17-2.82h-.8L19.7 14l-.92 1.97h.75l2.46-5.64h-.76zM5.31 10.73V12h1.77a1.52 1.52 0 0 1-.65 1 2 2 0 0 1-3-1.05 1.9 1.9 0 0 1 0-1.27 1.91 1.91 0 0 1 1.88-1.35 1.83 1.83 0 0 1 1.27.5l1-.95A3.14 3.14 0 0 0 5.33 8 3.26 3.26 0 0 0 2.4 9.83a3.24 3.24 0 0 0 0 3 3.28 3.28 0 0 0 2.95 1.82 3.24 3.24 0 0 0 2.19-.79 3.22 3.22 0 0 0 1-2.43c0-.22 0-.45-.05-.67z" />
  </svg>
);

const PaytmIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M15.85 8.167a.204.204 0 0 0-.04.004c-.68.19-.543 1.148-1.781 1.23h-.12a.23.23 0 0 0-.052.005h-.001a.24.24 0 0 0-.184.235v1.09c0 .134.106.241.237.241h.645v4.623c0 .132.104.238.233.238h1.058a.236.236 0 0 0 .233-.238v-4.623h.6c.13 0 .236-.107.236-.241v-1.09a.239.239 0 0 0-.236-.24h-.612V8.386a.218.218 0 0 0-.216-.22zm4.225 1.17c-.398 0-.762.15-1.042.395v-.124a.238.238 0 0 0-.234-.224h-1.07a.24.24 0 0 0-.236.242v5.92a.24.24 0 0 0 .236.242h1.07c.12 0 .217-.091.233-.209v-4.25a.393.393 0 0 1 .371-.408h.196a.41.41 0 0 1 .226.09.405.405 0 0 1 .145.319v4.074l.004.155a.24.24 0 0 0 .237.241h1.07a.239.239 0 0 0 .235-.23l-.001-4.246c0-.14.062-.266.174-.34a.419.419 0 0 1 .196-.068h.198c.23.02.37.2.37.408.005 1.396.004 2.8.004 4.224a.24.24 0 0 0 .237.241h1.07c.13 0 .236-.108.236-.241v-4.543c0-.31-.034-.442-.08-.577a1.601 1.601 0 0 0-1.51-1.09h-.015a1.58 1.58 0 0 0-1.152.5c-.291-.308-.7-.5-1.153-.5zM.232 9.4A.234.234 0 0 0 0 9.636v5.924c0 .132.096.238.216.241h1.09c.13 0 .237-.107.237-.24l.004-1.658H2.57c.857 0 1.453-.605 1.453-1.481v-1.538c0-.877-.596-1.484-1.453-1.484H.232zm9.032 0a.239.239 0 0 0-.237.241v2.47c0 .94.657 1.608 1.579 1.608h.675s.016 0 .037.004a.253.253 0 0 1 .222.253c0 .13-.096.235-.219.251l-.018.004-.303.006H9.739a.239.239 0 0 0-.236.24v1.09a.24.24 0 0 0 .236.242h1.75c.92 0 1.577-.669 1.577-1.608v-4.56a.239.239 0 0 0-.236-.24h-1.07a.239.239 0 0 0-.236.24c-.005.787 0 1.525 0 2.255a.253.253 0 0 1-.25.25h-.449a.253.253 0 0 1-.25-.255c.005-.754-.005-1.5-.005-2.25a.239.239 0 0 0-.236-.24zm-4.004.006a.232.232 0 0 0-.238.226v1.023c0 .132.113.24.252.24h1.413c.112.017.2.1.213.23v.14c-.013.124-.1.214-.207.224h-.7c-.93 0-1.594.63-1.594 1.515v1.269c0 .88.57 1.506 1.495 1.506h1.94c.348 0 .63-.27.63-.6v-4.136c0-1.004-.508-1.637-1.72-1.637zm-3.713 1.572h.678c.139 0 .25.115.25.256v.836a.253.253 0 0 1-.25.256h-.1c-.192.002-.386 0-.578 0zm4.67 1.977h.445c.139 0 .252.108.252.24v.932a.23.23 0 0 1-.014.076.25.25 0 0 1-.238.164h-.445a.247.247 0 0 1-.252-.24v-.933c0-.132.113-.239.252-.239Z" />
  </svg>
);

const PaymentForm = ({ booking, amount, onSuccess }) => {
  const [method, setMethod] = useState('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('parkmate_token') || localStorage.getItem('parkeasy_token');
      if (!token) {
        alert("You must be logged in to book a slot.");
        setLoading(false);
        return;
      }

      const payload = {
        slotId: booking.slotId,
        vehicleNumber: booking.vehicleNumber || 'UNKNOWN',
        amount: amount ?? booking.totalAmount ?? 0,
      };

      const res = await fetch('/api/book-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      const bookingDoc = data.booking;

      // Record payment details (for admin analytics)
      try {
        await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bookingId: bookingDoc?._id,
            amount: payload.amount,
            method,
            upiId: method === 'upi' ? upiId : undefined,
          }),
        });
      } catch (paymentErr) {
        console.error('Failed to record payment:', paymentErr);
      }

      // Clear temporary booking selection now that everything is confirmed
      localStorage.removeItem('parkmate_booking');
      localStorage.removeItem('parkmate_selected_slot');

      setPaid(true);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error occurred while booking.');
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="card-static p-10 text-center animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-emerald-500 text-2xl" />
        </div>
        <h3 className="text-[20px] font-extrabold text-gray-900 mb-1">Payment Successful!</h3>
        <p className="text-[13px] text-gray-500 mb-6">Your slot is confirmed. Drive safely! 🚗</p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Transaction ID</p>
          <p className="text-gray-800 font-mono font-bold text-[13px]">PE-{Date.now()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-static p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
          <FaLock className="text-violet-600 text-sm" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-[15px] leading-none">Secure Payment</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">256-bit SSL encrypted</p>
        </div>
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {[
          { id: 'card', label: 'Card', Icon: FaCreditCard },
          { id: 'upi', label: 'UPI', Icon: FaMobileAlt },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            id={`payment-tab-${id}`}
            onClick={() => setMethod(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${method === id
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Icon className="text-[12px]" /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {method === 'card' ? (
          <>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardForm.name}
                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                required
                className="input-field"
                id="card-name"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Card Number</label>
              <div className="relative">
                <FaCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[12px]" />
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: formatCard(e.target.value) })}
                  required
                  className="input-field input-field-icon font-mono tracking-widest text-[13px]"
                  id="card-number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Expiry</label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                  required
                  className="input-field font-mono text-[13px]"
                  id="card-expiry"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">CVV</label>
                <input
                  type="password"
                  placeholder="•••"
                  maxLength={4}
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                  required
                  className="input-field font-mono text-[13px]"
                  id="card-cvv"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">UPI ID</label>
            <div className="relative">
              <FaMobileAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[12px]" />
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                className="input-field input-field-icon text-[13px]"
                id="upi-id"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Supports PhonePe, GPay, Paytm & all UPI apps</p>
            <div className="flex gap-2 mt-3">
              {[
                { id: 'phonepe', label: 'PhonePe', icon: <PhonePeIcon width="1.2em" height="1.2em" />, suffix: '@ybl', color: '#6d28d9', bg: '#f5f3ff', border: '#7c3aed' },
                { id: 'gpay', label: 'GPay', icon: <GooglePayIcon width="1.2em" height="1.2em" />, suffix: '@okicici', color: '#1d4ed8', bg: '#eff6ff', border: '#3b82f6' },
                { id: 'paytm', label: 'Paytm', icon: <PaytmIcon width="1.2em" height="1.2em" />, suffix: '@paytm', color: '#0d7377', bg: '#f0fdfa', border: '#14b8a6' },
              ].map((app) => {
                const isSelected = selectedUpiApp === app.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    id={`upi-app-${app.id}`}
                    onClick={() => {
                      setSelectedUpiApp(app.id);
                      setUpiId((prev) => {
                        const base = prev.split('@')[0] || 'yourname';
                        return `${base}${app.suffix}`;
                      });
                    }}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-200 text-[11px] font-bold"
                    style={{
                      borderColor: isSelected ? app.border : '#e5e7eb',
                      background: isSelected ? app.bg : '#fff',
                      color: isSelected ? app.color : '#6b7280',
                      boxShadow: isSelected ? `0 0 0 3px ${app.border}33` : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <span className="flex items-center justify-center text-xl leading-none w-6 h-6">{app.icon}</span>
                    <span>{app.label}</span>
                    {isSelected && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: app.color }}
                      >
                        ✓ Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        <hr className="divider" />

        <button
          type="submit"
          disabled={loading}
          id="payment-confirm-btn"
          className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <><FaLock className="text-[11px]" /> Confirm Payment</>
          )}
        </button>

      </form>
    </div>
  );
};

export default PaymentForm;
