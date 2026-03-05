import { useState } from 'react';
import { FaCreditCard, FaMobileAlt, FaLock, FaCheckCircle } from 'react-icons/fa';

const PaymentForm = ({ booking, onSuccess }) => {
  const [method, setMethod] = useState('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setPaid(true); onSuccess?.(); }, 1800);
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
          { id: 'card', label: 'Card',  Icon: FaCreditCard },
          { id: 'upi',  label: 'UPI',   Icon: FaMobileAlt  },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            id={`payment-tab-${id}`}
            onClick={() => setMethod(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
              method === id
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
              {['📱 PhonePe', '🟢 GPay', '🟡 Paytm'].map((app, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:border-violet-300 hover:text-violet-700 transition-all duration-150 bg-white"
                >
                  {app}
                </button>
              ))}
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
