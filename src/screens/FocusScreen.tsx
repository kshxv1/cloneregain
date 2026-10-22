import React, { useState } from 'react';
import { Play, BarChart2, Target, Sliders, CheckCircle2 } from 'lucide-react';
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
  const percentRounded = Math.min(100, Math.round(progress * 100));

  const goalHours = Math.floor(goals.dailyMin / 60);
  const goalMinutes = goals.dailyMin % 60;
  const goalDisplay =
    goalMinutes > 0
      ? `${goalHours}h ${goalMinutes}m`
      : `${goalHours}h`;

  return (
    <div className="relative min-h-screen pb-28 pt-3 sm:pt-6 px-4 sm:px-6 md:px-8 w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto flex flex-col justify-between select-none transition-all">
      {/* Soft radial ambient glow behind the top */}
      <div
        className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] rounded-full blur-3xl opacity-15"
        style={{ background: 'var(--color-primary)' }}
      />

      {/* Top Bar: Profile avatar left, Brand indicator center, Stats button right */}
      <div className="flex items-center justify-between z-10 pt-1 sm:pt-2">
        <button
          onClick={() => setShowProfileModal(true)}
          aria-label="Profile and settings"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm text-[var(--color-primary-ink)] transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          style={{ backgroundColor: profile.avatarColor || 'var(--color-primary)' }}
        >
          {profile.avatarInitial || 'K'}
        </button>

        {/* Center subtle brand / status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#141925]/80 border border-[#273049] rounded-full text-xs text-[#8B95AD]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <span className="font-medium text-[#F2F5FA]">Stillwater</span>
        </div>

        <button
          onClick={() => setShowStatsScreen(true)}
          aria-label="View statistics"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#F2F5FA] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <BarChart2 size={19} />
        </button>
      </div>

      {/* Main Content Area: Responsive Grid on Tablets (md:grid-cols-12), Mobile-First Stack on Phones */}
      <div className="my-auto py-4 md:py-6 md:grid md:grid-cols-12 md:gap-8 md:items-center">
        {/* Left Column (Hero Circular Focus Ring & Tablet Docked Action) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div
            className={`flex flex-col items-center justify-center transition-all ${
              tourStep === 1 ? 'relative z-50 ring-2 ring-[var(--color-primary)] rounded-full p-2' : ''
            }`}
          >
            <CircularProgress
              progress={progress}
              showTopArrow={true}
              onTopArrowClick={() => setShowStatsScreen(true)}
            >
              <div className="space-y-1.5 sm:space-y-2 flex flex-col items-center">
                <span className="font-display font-bold text-4xl xs:text-5xl sm:text-6xl tracking-tight text-[#F2F5FA] tabular-nums block drop-shadow-sm">
                  {formatDisplayTime(todayFocusedMinutes)}
                </span>

                {/* Interactive Goal Pill */}
                <button
                  onClick={() => setIsEditGoalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#8B95AD] hover:text-[#F2F5FA] bg-[#141925]/60 hover:bg-[#1C2333] border border-[#273049] transition-all group cursor-pointer shadow-sm active:scale-95"
                >
                  <Target size={13} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                  <span>Goal: {goalDisplay}</span>
                  {isGoalReached ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      • <CheckCircle2 size={12} className="inline" /> Done!
                    </span>
                  ) : (
                    <span className="text-[var(--color-primary)] font-semibold">
                      • {percentRounded}%
                    </span>
                  )}
                </button>
              </div>
            </CircularProgress>

            {/* Quick Custom Goal Button */}
            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <button
                onClick={() => setIsEditGoalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-[#8B95AD] hover:text-[#F2F5FA] px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-[#273049]"
              >
                <Sliders size={12} />
                <span>Set Custom Goal</span>
              </button>
            </div>
          </div>

          {/* Docked Action Button on Tablet Screens */}
          <div className="hidden md:block w-full pt-6">
            <button
              onClick={() => setShowStartSessionModal(true)}
              className="w-full h-15 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full pl-6 pr-2.5 flex items-center justify-between shadow-[0_12px_36px_rgba(255,255,255,0.18)] transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span className="font-display font-semibold text-base tracking-tight text-neutral-950">
                  Start focus timer
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  Timer • Stopwatch • Pomodoro
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-400 group-hover:bg-emerald-300 flex items-center justify-center text-neutral-950 shadow-md transition-transform group-hover:scale-105">
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Column (Screen Time Card & Suggested Schedules) */}
        <div className="md:col-span-7 space-y-4 sm:space-y-5 mt-6 md:mt-0 z-10">
          <div className={tourStep === 2 ? 'relative z-50 ring-2 ring-[var(--color-primary)] rounded-[26px]' : ''}>
            <ScreenTimeCard />
          </div>
          <SuggestedScheduleCarousel />
        </div>
      </div>

      {/* Primary Floating Action Bar for Mobile Viewports (hidden on md+ screens where docked button is used) */}
      <div
        className={`md:hidden sticky bottom-20 z-20 pt-1 flex justify-center ${
          tourStep === 3 ? 'relative z-50 ring-2 ring-[var(--color-primary)] rounded-full' : ''
        }`}
      >
        <button
          onClick={() => setShowStartSessionModal(true)}
          className="w-full max-w-sm sm:max-w-md h-14 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full pl-6 pr-2.5 flex items-center justify-between shadow-[0_12px_36px_rgba(255,255,255,0.18)] transition-all active:scale-[0.98] group cursor-pointer"
        >
          <div className="flex flex-col text-left">
            <span className="font-display font-semibold text-base tracking-tight text-neutral-950">
              Start focus timer
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">
              Timer • Stopwatch • Pomodoro
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-400 group-hover:bg-emerald-300 flex items-center justify-center text-neutral-950 shadow-md transition-transform group-hover:scale-105">
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </div>
        </button>
      </div>

      {/* Custom Focus Goal Modal */}
      <EditGoalModal
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
      />
    </div>
  );
};
