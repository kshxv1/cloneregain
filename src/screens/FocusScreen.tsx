import React, { useState } from 'react';
import { Play, BarChart2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CircularProgress } from '../components/CircularProgress';
import { ScreenTimeCard } from '../components/ScreenTimeBar';
import { SuggestedScheduleCarousel } from '../components/SuggestedScheduleCard';
import { EditGoalModal } from '../components/EditGoalModal';

export const FocusScreen: React.FC = () => {
  const {
    todayFocusedMinutes,
    goals,
    setShowStatsScreen,
    setShowProfileModal,
    setShowStartSessionModal,
    profile,
    tourStep,
  } = useApp();

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);

  const formatDisplayTime = (totalMin: number) => {
    if (totalMin === 0) return '0m';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const progress = goals.dailyMin > 0 ? todayFocusedMinutes / goals.dailyMin : 0;
  const isGoalReached = todayFocusedMinutes >= goals.dailyMin && goals.dailyMin > 0;

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-5 max-w-md mx-auto flex flex-col justify-between select-none">
      {/* Soft radial ambient glow behind the top */}
      <div
        className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-10"
        style={{ background: 'var(--color-primary)' }}
      />

      {/* Top Bar: Profile avatar left, Stats button right */}
      <div className="flex items-center justify-between z-10 pt-2">
        <button
          onClick={() => setShowProfileModal(true)}
          aria-label="Profile and settings"
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-[var(--color-primary-ink)] transition-transform hover:scale-105 active:scale-95 shadow-md"
          style={{ backgroundColor: profile.avatarColor || 'var(--color-primary)' }}
        >
          {profile.avatarInitial || 'K'}
        </button>

        <button
          onClick={() => setShowStatsScreen(true)}
          aria-label="View statistics"
          className="w-10 h-10 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#F2F5FA] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-all shadow-md active:scale-95"
        >
          <BarChart2 size={19} />
        </button>
      </div>

      {/* Central Large Focus Ring */}
      <div className={`my-auto flex flex-col items-center justify-center py-6 transition-transform ${tourStep === 1 ? 'relative z-50 ring-2 ring-[var(--color-primary)] rounded-full p-2' : ''}`}>
        <CircularProgress
          progress={progress}
          size={270}
          strokeWidth={24}
          showTopArrow={true}
          onTopArrowClick={() => setShowStatsScreen(true)}
        >
          <div className="space-y-1">
            <span className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-[#F2F5FA] tabular-nums block">
              {formatDisplayTime(todayFocusedMinutes)}
            </span>
            <button
              onClick={() => setIsEditGoalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-[#8B95AD] hover:text-[#F2F5FA] hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <span>Focus goal {Math.round(goals.dailyMin / 60)}h</span>
              {isGoalReached && (
                <span className="text-emerald-400 font-semibold">• Goal hit!</span>
              )}
            </button>
          </div>
        </CircularProgress>
      </div>

      {/* Lower Section: Screen-time card & Suggested schedule carousel */}
      <div className="space-y-4 mb-4 z-10">
        <div className={tourStep === 2 ? 'relative z-50 ring-2 ring-[var(--color-primary)] rounded-[26px]' : ''}>
          <ScreenTimeCard />
        </div>
        <SuggestedScheduleCarousel />
      </div>

      {/* Primary Floating Action Bar (White / High Contrast pill) */}
      <div className={`sticky bottom-20 z-20 pt-1 flex justify-center ${tourStep === 3 ? 'relative z-50 ring-2 ring-[var(--color-primary)] rounded-full' : ''}`}>
        <button
          onClick={() => setShowStartSessionModal(true)}
          className="w-full max-w-sm h-14 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full pl-6 pr-2.5 flex items-center justify-between shadow-[0_12px_36px_rgba(255,255,255,0.18)] transition-all active:scale-[0.98] group"
        >
          <span className="font-display font-semibold text-base tracking-tight text-neutral-950">
            Start focus timer
          </span>
          <div className="w-10 h-10 rounded-full bg-emerald-400 group-hover:bg-emerald-300 flex items-center justify-center text-neutral-950 shadow-md transition-transform group-hover:scale-105">
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </div>
        </button>
      </div>

      {/* Edit Goal modal */}
      <EditGoalModal
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
      />
    </div>
  );
};
