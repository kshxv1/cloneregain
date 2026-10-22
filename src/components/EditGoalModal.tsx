import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({ isOpen, onClose }) => {
  const { goals, updateGoals } = useApp();
  const [dailyHours, setDailyHours] = useState(goals.dailyMin / 60);
  const [weeklyHours, setWeeklyHours] = useState(goals.weeklyMin / 60);
  const [isAutoWeekly, setIsAutoWeekly] = useState(true);

  if (!isOpen) return null;

  const handleDailyChange = (val: number) => {
    setDailyHours(val);
    if (isAutoWeekly) {
      setWeeklyHours(Math.round(val * 5 * 10) / 10);
    }
  };

  const handleSave = () => {
    updateGoals({
      dailyMin: Math.round(dailyHours * 60),
      weeklyMin: Math.round(weeklyHours * 60)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center">
              <Target size={18} />
            </div>
            <h3 className="text-lg font-bold font-display text-[#F2F5FA]">
              Edit Focus Goals
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Daily Goal Slider */}
        <div className="space-y-3 bg-[#1C2333]/50 p-4 rounded-2xl border border-[#273049]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#F2F5FA]">Daily Target</span>
            <span className="text-xl font-bold font-display text-[var(--color-primary)]">
              {dailyHours}h / day
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={dailyHours}
            onChange={(e) => handleDailyChange(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#8B95AD]">
            <span>1 hour</span>
            <span>6 hours (standard)</span>
            <span>12 hours</span>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="space-y-3 bg-[#1C2333]/50 p-4 rounded-2xl border border-[#273049]">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-[#F2F5FA] block">Weekly Target</span>
              <span className="text-[11px] text-[#8B95AD]">
                {isAutoWeekly ? 'Auto: 5 days × daily goal' : 'Custom target'}
              </span>
            </div>
            <span className="text-xl font-bold font-display text-[var(--color-primary)]">
              {weeklyHours}h / week
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={weeklyHours}
            onChange={(e) => {
              setIsAutoWeekly(false);
              setWeeklyHours(parseFloat(e.target.value));
            }}
            className="w-full accent-[var(--color-primary)] cursor-pointer"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-sm rounded-full transition-transform active:scale-95 shadow-lg"
        >
          Save Goal
        </button>
      </div>
    </div>
  );
};
