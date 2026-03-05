import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaRupeeSign } from 'react-icons/fa';

const SlotCard = ({ slot }) => {
  const navigate = useNavigate();
  const { slotId, status, price, id } = slot;
  const isAvailable = status === 'available';

  const handleBook = () => {
    localStorage.setItem('parkmate_selected_slot', JSON.stringify(slot));
    navigate('/payment');
  };

  return (
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
          {isAvailable
            ? <FaCheckCircle className="text-[9px]" />
            : <FaTimesCircle className="text-[9px]" />
          }
          {isAvailable ? 'Open' : 'Taken'}
        </span>
      </div>

      {/* Slot ID */}
      <div>
        <p className={`font-bold text-[15px] tracking-tight leading-none ${isAvailable ? 'text-emerald-800' : 'text-red-800'}`}>
          {slotId || `P-${String(id).padStart(3, '0')}`}
        </p>
        <p className={`text-[12px] mt-0.5 font-semibold flex items-center gap-0.5 ${isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
          <FaRupeeSign className="text-[10px]" />{price}
          <span className="font-normal opacity-70">/hr</span>
        </p>
      </div>

      {/* Button */}
      {isAvailable ? (
        <button
          onClick={handleBook}
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
  );
};

export default SlotCard;
