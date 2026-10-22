import React, { useState } from 'react';
import { Plus, Clock, Shield, Sparkles, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Schedule } from '../types';
import { SUGGESTED_SCHEDULES } from '../utils/demoData';

export const PlanScreen: React.FC = () => {
  const {
    schedules,
    toggleSchedule,
    setEditingSchedule,
    setShowCreateSchedule,
    profile,
    openPaywall,
    addSuggestedSchedule,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [carouselIndex, setCarouselIndex] = useState(0);

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleCreateNew = () => {
    setEditingSchedule(null);
    setShowCreateSchedule(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowCreateSchedule(true);
  };

  // Filter schedules that repeat on selected day
  const activeDaySchedules = schedules.filter(s => s.days.includes(selectedDay));

  return (
    <div className="min-h-screen pb-32 pt-5 px-5 max-w-md mx-auto flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center pt-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F2F5FA]">
            Create your<br />study schedule
          </h2>
          <p className="text-xs text-[#8B95AD] mt-1">
            Build unshakeable daily habits with auto-blocking routines.
          </p>
        </div>

        {/* Suggestion Carousel (matches reference screenshot #1) */}
        <div className="relative">
          <div
            className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.offsetWidth;
              const idx = Math.round(scrollLeft / (width * 0.85));
              setCarouselIndex(Math.min(SUGGESTED_SCHEDULES.length - 1, Math.max(0, idx)));
            }}
          >
            {SUGGESTED_SCHEDULES.map((sugg, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 w-full bg-[#141925] border border-[#273049] rounded-[24px] p-5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-[#F2F5FA]">
                    {sugg.name}
                  </h4>
                  <p className="text-xs text-[#8B95AD]">
                    {formatTime(sugg.from)} - {formatTime(sugg.to)} | {sugg.days.length === 5 ? 'Mon - Fri' : 'Everyday'}
                  </p>
                </div>
                <button
                  onClick={() => addSuggestedSchedule(idx)}
                  aria-label={`Add ${sugg.name}`}
                  className="w-11 h-11 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 flex items-center justify-center font-bold shadow-md active:scale-95 transition-transform"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>

          {/* Carousel dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {SUGGESTED_SCHEDULES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  carouselIndex === i ? 'w-5 bg-white/70' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Weekly Day Selector Strip */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-[#8B95AD] uppercase tracking-wider">
              {dayNames[selectedDay]} Routine ({activeDaySchedules.length})
            </span>
            <span className="text-xs text-[#8B95AD]">
              {schedules.filter(s => s.enabled).length} Active Routines
            </span>
          </div>

          <div className="flex justify-between bg-[#141925] border border-[#273049] rounded-2xl p-2">
            {dayLetters.map((d, index) => {
              const isSelected = selectedDay === index;
              const hasSchedule = schedules.some(s => s.days.includes(index) && s.enabled);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold shadow-md scale-105'
                      : 'text-[#8B95AD] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-medium">{d}</span>
                  {hasSchedule && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-[var(--color-primary-ink)]' : 'bg-[var(--color-primary)]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Existing Schedules for this day */}
        <div className="space-y-3">
          {activeDaySchedules.length === 0 ? (
            <div className="text-center py-6 bg-[#141925]/50 border border-dashed border-[#273049] rounded-2xl p-4">
              <Clock className="w-8 h-8 text-[#8B95AD] mx-auto mb-1 opacity-40" />
              <p className="text-xs text-[#8B95AD]">
                No study routine scheduled for {dayNames[selectedDay]}.
              </p>
            </div>
          ) : (
            activeDaySchedules.map(sched => (
              <div
                key={sched.id}
                onClick={() => handleEdit(sched)}
                className={`p-4 rounded-[22px] border transition-all cursor-pointer flex items-center justify-between ${
                  sched.enabled
                    ? 'bg-[#141925] border-[#273049] hover:border-[var(--color-primary)]/50'
                    : 'bg-[#141925]/40 border-[#273049]/40 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#F2F5FA]">
                      {sched.name}
                    </h4>
                    {sched.ultraFocus && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 uppercase">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8B95AD]">
                    {formatTime(sched.from)} - {formatTime(sched.to)}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#8B95AD] pt-0.5">
                    <span className="flex items-center gap-1">
                      <Shield size={11} className="text-teal-400" />
                      {sched.blockedAppIds.length} blocked
                    </span>
                    <span>•</span>
                    <span>{sched.breaks.count} breaks</span>
                  </div>
                </div>

                {/* Switch toggle (stops click propagation so card can be tapped to edit) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSchedule(sched.id);
                  }}
                  className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${
                    sched.enabled ? 'bg-emerald-400' : 'bg-[#273049]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-neutral-950 shadow-md transform transition-transform ${
                      sched.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Sticky Action: "Create Schedule" Button */}
      <div className="sticky bottom-20 z-20 pt-4 flex justify-center">
        <button
          onClick={handleCreateNew}
          className="w-full max-w-sm h-14 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full font-display font-semibold text-base shadow-[0_12px_36px_rgba(255,255,255,0.18)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={2.8} />
          <span>Create Schedule</span>
        </button>
      </div>
    </div>
  );
};
