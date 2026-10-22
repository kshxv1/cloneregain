import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { SUGGESTED_SCHEDULES } from '../utils/demoData';
import { useApp } from '../store/AppContext';

export const SuggestedScheduleCarousel: React.FC = () => {
  const { addSuggestedSchedule } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [snackMessage, setSnackMessage] = useState<{ text: string; undo: () => void } | null>(null);
  const [addedIndexes, setAddedIndexes] = useState<number[]>([]);

  const handleAdd = (index: number) => {
    const res = addSuggestedSchedule(index);
    if (res.success) {
      setAddedIndexes(prev => [...prev, index]);
      setSnackMessage({
        text: `Added "${res.scheduleName}" to your schedule`,
        undo: () => {
          res.undo();
          setAddedIndexes(prev => prev.filter(i => i !== index));
          setSnackMessage(null);
        }
      });
      setTimeout(() => {
        setSnackMessage(current => (current?.text.includes(res.scheduleName) ? null : current));
      }, 5000);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formatDays = (days: number[]) => {
    if (days.length === 7) return 'Everyday';
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Mon - Fri';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => dayNames[d]).join(', ');
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-medium text-[#8B95AD]">
          Suggested schedule
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const width = e.currentTarget.offsetWidth;
          const index = Math.round(scrollLeft / (width * 0.8));
          setActiveIndex(Math.min(SUGGESTED_SCHEDULES.length - 1, Math.max(0, index)));
        }}
      >
        {SUGGESTED_SCHEDULES.map((sugg, idx) => {
          const isAdded = addedIndexes.includes(idx);
          return (
            <div
              key={idx}
              className="snap-center shrink-0 w-[88%] max-w-[340px] bg-[#141925] border border-[#273049] rounded-[24px] p-4 flex items-center justify-between transition-all"
            >
              <div className="space-y-1">
                <h4 className="text-[15px] font-semibold text-[#F2F5FA]">
                  {sugg.name}
                </h4>
                <p className="text-[13px] text-[#8B95AD]">
                  {formatTime(sugg.from)} - {formatTime(sugg.to)} | {formatDays(sugg.days)}
                </p>
              </div>

              <button
                onClick={() => handleAdd(idx)}
                aria-label={`Add ${sugg.name}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isAdded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#273049]/60 hover:bg-[#273049] text-[#F2F5FA] active:scale-95'
                }`}
              >
                {isAdded ? <Check size={18} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        {SUGGESTED_SCHEDULES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === i ? 'w-5 bg-white/70' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Undo Snackbar */}
      {snackMessage && (
        <div className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto z-40 bg-[#1C2333] border border-[#273049] rounded-2xl p-3.5 flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-[13px] text-[#F2F5FA] truncate mr-2">
            {snackMessage.text}
          </span>
          <button
            onClick={snackMessage.undo}
            className="text-[13px] font-semibold text-[var(--color-primary)] hover:underline shrink-0"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};
