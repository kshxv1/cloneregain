import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const ScreenTimeCard: React.FC = () => {
  const { setShowScreenTimeDetail, todayFocusedMinutes } = useApp();

  // Mock baseline screen time: 2h 45m or 165 minutes, with focus minutes marked as productive
  const totalScreenMinutes = Math.max(todayFocusedMinutes + 35, 140);
  const productiveMinutes = Math.min(todayFocusedMinutes + 20, totalScreenMinutes);
  const productivePercent = Math.min(100, Math.round((productiveMinutes / totalScreenMinutes) * 100));

  const formatHoursMin = (totalMin: number) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <button
      onClick={() => setShowScreenTimeDetail(true)}
      className="w-full bg-[#141925] border border-[#273049] rounded-[24px] p-4 text-left transition-all hover:border-[#273049]/90 active:scale-[0.99] group"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <span className="text-[17px] font-bold text-[#F2F5FA] font-display">
            {formatHoursMin(totalScreenMinutes)}
          </span>
          <p className="text-[13px] text-[#8B95AD]">
            Screen Time
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8B95AD] group-hover:text-white group-hover:bg-white/10 transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Thin Segmented Progress Bar */}
      <div className="w-full h-2 rounded-full bg-[#1C2333] overflow-hidden flex">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${productivePercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2 text-[11px] text-[#8B95AD]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Productive: {formatHoursMin(productiveMinutes)} ({productivePercent}%)
        </span>
        <span>Tap for apps breakdown</span>
      </div>
    </button>
  );
};
