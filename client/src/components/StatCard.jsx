

const StatCard = ({ title, amount, sub, icon, color, bgIcon, iconColor }) => (

  <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
    <div className={`p-3 rounded-full ${bgIcon} ${iconColor} flex items-center justify-center`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="flex flex-col">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${color}`}>{amount}</p>
        {sub && <span className="text-[10px] text-gray-400 font-medium italic">{sub}</span>}
      </div>
    </div>
  </div>
);

export default StatCard