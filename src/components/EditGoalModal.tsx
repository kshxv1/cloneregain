import React, { useState, useEffect } from 'react';
import { X, Target, Check, Clock, Sparkles, Plus, Minus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import confetti from 'canvas-confetti';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_GOALS = [
  { label: '30m', minutes: 30, desc: 'Casual focus' },
  { label: '1h', minutes: 60, desc: 'Daily habit' },
  { label: '2h', minutes: 120, desc: 'Solid progress' },
  { label: '3h', minutes: 180, desc: 'Deep study' },
  { label: '4h', minutes: 240, desc: 'High productivity' },
  { label: '6h', minutes: 360, desc: 'Intensive block' },
  { label: '8h', minutes: 480, desc: 'Full-day sprint' },
];

export const EditGoalModal: React.FC<EditGoalModalProps> = ({ isOpen, onClose }) => {
  const { goals, updateGoals, todayFocusedMinutes } = useApp();

  const [hours, setHours] = useState<number>(Math.floor(goals.dailyMin / 60));
  const [minutes, setMinutes] = useState<number>(goals.dailyMin % 60);
  const [weeklyDays, setWeeklyDays] = useState<number>(5);
  const [customWeeklyMin, setCustomWeeklyMin] = useState<number>(goals.weeklyMin);
  const [isCustomWeekly, setIsCustomWeekly] = useState<boolean>(
    goals.weeklyMin !== goals.dailyMin * 5
  );
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('custom');

  useEffect(() => {
    if (isOpen) {
      const h = Math.floor(goals.dailyMin / 60);
      const m = goals.dailyMin % 60;
      setHours(h);
      setMinutes(m);
      setCustomWeeklyMin(goals.weeklyMin);
      setIsCustomWeekly(goals.weeklyMin !== goals.dailyMin * 5);
    }
  }, [isOpen, goals]);

  if (!isOpen) return null;

  const totalDailyMinutes = Math.max(15, hours * 60 + minutes);
  const calculatedWeeklyMinutes = isCustomWeekly
    ? customWeeklyMin
    : totalDailyMinutes * weeklyDays;

  const handleSelectPreset = (presetMins: number) => {
    const h = Math.floor(presetMins / 60);
    const m = presetMins % 60;
    setHours(h);
    setMinutes(m);
  };

  const incrementHours = (delta: number) => {
    setHours((prev) => Math.min(16, Math.max(0, prev + delta)));
  };

  const incrementMinutes = (delta: number) => {
    setMinutes((prev) => {
      const next = prev + delta;
      if (next >= 60) {
        setHours((h) => Math.min(16, h + 1));
        return 0;
      }
      if (next < 0) {
        if (hours > 0) {
          setHours((h) => Math.max(0, h - 1));
          return 45;
        }
        return 0;
      }
      return next;
    });
  };

  const formatMinDisplay = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const handleSave = () => {
    updateGoals({
      dailyMin: totalDailyMinutes,
      weeklyMin: calculatedWeeklyMinutes,
    });

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#5EEAD4', '#38BDF8', '#FBBF24'],
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const currentProgressPercent = Math.min(
    100,
    Math.round((todayFocusedMinutes / totalDailyMinutes) * 100)
  );
  const remainingMins = Math.max(0, totalDailyMinutes - todayFocusedMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#273049]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shadow-inner">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-[#F2F5FA]">
                Custom Focus Goal
              </h3>
              <p className="text-xs text-[#8B95AD]">
                Set your daily commitment and weekly rhythm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD] hover:text-[#F2F5FA] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch: Presets vs Custom Entry */}
        <div className="grid grid-cols-2 p-1 bg-[#0D121F] rounded-xl border border-[#273049]/60">
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-[#1C2333] text-[#F2F5FA] shadow-sm'
                : 'text-[#8B95AD] hover:text-[#F2F5FA]'
            }`}
          >
            Custom Time
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-[#1C2333] text-[#F2F5FA] shadow-sm'
                : 'text-[#8B95AD] hover:text-[#F2F5FA]'
            }`}
          >
            Quick Presets
          </button>
        </div>

        {activeTab === 'custom' ? (
          /* Custom Hours & Minutes Input */
          <div className="space-y-4">
            <div className="bg-[#1C2333]/60 p-4 sm:p-5 rounded-2xl border border-[#273049] space-y-4">
              <div className="text-xs uppercase tracking-wider text-[#8B95AD] font-semibold">
                Daily Focus Duration
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Hours selector */}
                <div className="bg-[#141925] p-3 sm:p-4 rounded-xl border border-[#273049]/80 flex flex-col items-center">
                  <span className="text-[11px] font-medium text-[#8B95AD] mb-1">
                    Hours
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 my-1">
                    <button
                      type="button"
                      onClick={() => incrementHours(-1)}
                      disabled={hours <= 0 && minutes <= 15}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-40 flex items-center justify-center text-[#F2F5FA]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-3xl font-bold font-display text-[#F2F5FA] tabular-nums min-w-[2ch] text-center">
                      {hours}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementHours(1)}
                      disabled={hours >= 16}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-40 flex items-center justify-center text-[#F2F5FA]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] text-[#8B95AD]">0 to 16 hrs</span>
                </div>

                {/* Minutes selector */}
                <div className="bg-[#141925] p-3 sm:p-4 rounded-xl border border-[#273049]/80 flex flex-col items-center">
                  <span className="text-[11px] font-medium text-[#8B95AD] mb-1">
                    Minutes
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 my-1">
                    <button
                      type="button"
                      onClick={() => incrementMinutes(-15)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-[#F2F5FA]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-3xl font-bold font-display text-[#F2F5FA] tabular-nums min-w-[2ch] text-center">
                      {minutes.toString().padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementMinutes(15)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-[#F2F5FA]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] text-[#8B95AD]">±15 min steps</span>
                </div>
              </div>

              {/* Slider for smooth adjustment */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8B95AD]">Quick slider</span>
                  <span className="text-[var(--color-primary)] font-bold">
                    {formatMinDisplay(totalDailyMinutes)}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="720"
                  step="15"
                  value={totalDailyMinutes}
                  onChange={(e) => {
                    const total = parseInt(e.target.value, 10);
                    setHours(Math.floor(total / 60));
                    setMinutes(total % 60);
                  }}
                  className="w-full accent-[var(--color-primary)] cursor-pointer h-2 bg-[#0D121F] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#8B95AD]">
                  <span>15m</span>
                  <span>4h</span>
                  <span>8h</span>
                  <span>12h</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Quick Presets Grid */
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#8B95AD] font-semibold">
              Select A Preset Goal
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_GOALS.map((preset) => {
                const isSelected = totalDailyMinutes === preset.minutes;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleSelectPreset(preset.minutes)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] text-[#F2F5FA]'
                        : 'bg-[#1C2333]/50 border-[#273049] text-[#8B95AD] hover:text-[#F2F5FA] hover:border-[#3a4768]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-bold font-display text-[#F2F5FA]">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <Check size={14} className="text-[var(--color-primary)]" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#8B95AD] block">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Progress Preview Card */}
        <div className="bg-[#1C2333]/40 border border-[#273049] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B95AD] flex items-center gap-1.5">
              <Clock size={13} className="text-[var(--color-primary)]" />
              Today&apos;s Forecast
            </span>
            <span className="text-xs font-bold text-[#F2F5FA]">
              {formatMinDisplay(todayFocusedMinutes)} / {formatMinDisplay(totalDailyMinutes)} ({currentProgressPercent}%)
            </span>
          </div>

          <div className="w-full bg-[#0D121F] h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-[#8B95AD] flex items-center justify-between">
            <span>
              {remainingMins === 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles size={12} /> Target already achieved today!
                </span>
              ) : (
                `${formatMinDisplay(remainingMins)} needed to hit this goal today`
              )}
            </span>
            <span className="text-right tabular-nums">
              {Math.round(totalDailyMinutes * 7 / 60)}h/wk potential
            </span>
          </p>
        </div>

        {/* Weekly Target Configuration */}
        <div className="bg-[#1C2333]/50 p-4 rounded-2xl border border-[#273049] space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-[#F2F5FA] block">
                Weekly Target
              </span>
              <span className="text-[11px] text-[#8B95AD]">
                {isCustomWeekly ? 'Custom target per week' : `Calculated for ${weeklyDays} active focus days`}
              </span>
            </div>
            <span className="text-lg font-bold font-display text-[var(--color-primary)] tabular-nums">
              {formatMinDisplay(calculatedWeeklyMinutes)} / wk
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setIsCustomWeekly(false);
                setWeeklyDays(5);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                !isCustomWeekly && weeklyDays === 5
                  ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-[#141925] border-[#273049] text-[#8B95AD]'
              }`}
            >
              5 Days
            </button>
            <button
              onClick={() => {
                setIsCustomWeekly(false);
                setWeeklyDays(6);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                !isCustomWeekly && weeklyDays === 6
                  ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-[#141925] border-[#273049] text-[#8B95AD]'
              }`}
            >
              6 Days
            </button>
            <button
              onClick={() => {
                setIsCustomWeekly(false);
                setWeeklyDays(7);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                !isCustomWeekly && weeklyDays === 7
                  ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-[#141925] border-[#273049] text-[#8B95AD]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setIsCustomWeekly(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isCustomWeekly
                  ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-[#141925] border-[#273049] text-[#8B95AD]'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustomWeekly && (
            <div className="pt-2">
              <input
                type="range"
                min="60"
                max="3600"
                step="60"
                value={customWeeklyMin}
                onChange={(e) => setCustomWeeklyMin(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--color-primary)] cursor-pointer h-2 bg-[#0D121F] rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-[#8B95AD] hover:text-[#F2F5FA] font-semibold text-sm rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-3.5 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-sm rounded-full transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2 hover:brightness-105"
          >
            <Check size={16} strokeWidth={2.5} />
            Save Custom Goal
          </button>
        </div>
      </div>
    </div>
  );
};
