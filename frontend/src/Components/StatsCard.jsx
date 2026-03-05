/* Stripe-style StatsCard — horizontal layout, compact */
const StatsCard = ({ icon, label, value, color = 'purple', suffix = '' }) => {
  const iconClass = {
    purple: 'icon-purple',
    blue:   'icon-blue',
    green:  'icon-green',
    red:    'icon-red',
    indigo: 'icon-indigo',
    amber:  'icon-amber',
  }[color] || 'icon-purple';

  const valueColor = {
    purple: 'text-violet-700',
    blue:   'text-blue-700',
    green:  'text-emerald-700',
    red:    'text-red-600',
    indigo: 'text-indigo-700',
  }[color] || 'text-violet-700';

  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl ${iconClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className="text-white text-[16px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-gray-400 font-medium leading-none mb-1.5">{label}</p>
        <p className={`font-extrabold text-[26px] leading-none tracking-tight ${valueColor}`}>
          {value}
          {suffix && <span className="text-sm font-semibold text-gray-400 ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
