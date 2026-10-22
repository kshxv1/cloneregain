import React, { useState } from 'react';
import { Plus, Clock, Shield, Sparkles, ChevronRight, Check, Calendar, Coffee } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Schedule } from '../types';
import { SUGGESTED_SCHEDULES } from '../utils/demoData';

export const PlanScreen: React.FC = () => {
  const {
    schedules,
    toggleSchedule,
    setEditingSchedule,
    setShowCreateSchedule,
    addSuggestedSchedule,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [carouselIndex, setCarouselIndex] = useState(0);

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const totalActiveRoutines = schedules.filter(s => s.enabled).length;

  return (
    <div className="min-h-screen pb-32 pt-4 sm:pt-6 px-4 sm:px-6 md:px-8 w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto flex flex-col justify-between select-none transition-all">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Title and Tablet Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-1 sm:pt-2 border-b border-[#273049]/40 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-1">
              <Calendar size={14} />
              <span>Routine Planner</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-[#F2F5FA] tracking-tight">
              Study Schedule
            </h2>
            <p className="text-xs sm:text-sm text-[#8B95AD] mt-1">
              Automate your deep work with intelligent app-blocking routines.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-[#8B95AD]">
              <strong className="text-[var(--color-primary)] font-bold">{totalActiveRoutines}</strong> active
            </span>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.8} />
              <span>New Routine</span>
            </button>
          </div>
        </div>

        {/* Suggestion Section: Swipeable Carousel on Mobile, Responsive Multi-Card Grid on Tablet */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B95AD] flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Suggested Routines
            </span>
            <span className="text-[11px] text-[#8B95AD]">1-tap to add</span>
          </div>

          {/* Carousel for mobile screens */}
          <div
            className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
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
                className="snap-center shrink-0 w-[90%] max-w-[340px] bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[#F2F5FA]">
                    {sugg.name}
                  </h4>
                  <p className="text-xs text-[#8B95AD]">
                    {formatTime(sugg.from)} - {formatTime(sugg.to)} • {sugg.days.length === 5 ? 'Mon - Fri' : 'Everyday'}
                  </p>
                </div>
                <button
                  onClick={() => addSuggestedSchedule(idx)}
                  aria-label={`Add ${sugg.name}`}
                  className="w-10 h-10 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 flex items-center justify-center font-bold shadow-md active:scale-95 transition-transform"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>

          {/* Mobile pagination indicator */}
          <div className="sm:hidden flex items-center justify-center gap-1.5 pt-1">
            {SUGGESTED_SCHEDULES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  carouselIndex === i ? 'w-5 bg-[var(--color-primary)]' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Grid for tablet and larger screens */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {SUGGESTED_SCHEDULES.map((sugg, idx) => (
              <div
                key={idx}
                className="bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex flex-col justify-between hover:border-[var(--color-primary)]/40 transition-all shadow-sm"
              >
                <div className="space-y-1 mb-3">
                  <h4 className="text-sm font-bold text-[#F2F5FA] truncate">
                    {sugg.name}
                  </h4>
                  <p className="text-xs text-[#8B95AD]">
                    {formatTime(sugg.from)} - {formatTime(sugg.to)}
                  </p>
                  <span className="text-[10px] text-[var(--color-primary)] font-medium block">
                    {sugg.days.length === 5 ? 'Weekdays' : 'Daily'}
                  </span>
                </div>
                <button
                  onClick={() => addSuggestedSchedule(idx)}
                  className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F2F5FA] flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Day Selector Strip: Compact pills on phone, Spacious labeled days on tablet */}
        <div className="space-y-2.5 pt-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#8B95AD] uppercase tracking-wider flex items-center gap-1.5">
              <span>{dayNamesFull[selectedDay]}</span>
              <span className="text-[var(--color-primary)]">({activeDaySchedules.length} scheduled)</span>
            </span>
            <span className="text-xs text-[#8B95AD]">
              Select day to view
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-3 bg-[#141925] border border-[#273049] rounded-2xl p-2 sm:p-3">
            {dayLetters.map((d, index) => {
              const isSelected = selectedDay === index;
              const hasSchedule = schedules.some(s => s.days.includes(index) && s.enabled);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold shadow-md scale-102'
                      : 'text-[#8B95AD] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-semibold sm:hidden">{d}</span>
                  <span className="hidden sm:inline text-xs font-bold">{dayNamesShort[index]}</span>
                  {hasSchedule ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? 'bg-[var(--color-primary-ink)]' : 'bg-[var(--color-primary)]'
                      }`}
                    />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full mt-1 bg-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Schedules: Single list on Mobile, Responsive 2-column Grid on Tablet */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#8B95AD] uppercase tracking-wider">
              Routines for {dayNamesShort[selectedDay]}
            </span>
          </div>

          {activeDaySchedules.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-[#141925]/40 border border-dashed border-[#273049] rounded-2xl p-6">
              <Clock className="w-9 h-9 text-[#8B95AD] mx-auto mb-2 opacity-40" />
              <h4 className="text-sm font-semibold text-[#F2F5FA]">No routine scheduled</h4>
              <p className="text-xs text-[#8B95AD] max-w-xs mx-auto mt-1">
                Take a break or set up a regular focus block for {dayNamesFull[selectedDay]}.
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F2F5FA] rounded-full transition-colors inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Create Routine</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {activeDaySchedules.map(sched => (
                <div
                  key={sched.id}
                  onClick={() => handleEdit(sched)}
                  className={`p-4 sm:p-5 rounded-[22px] border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                    sched.enabled
                      ? 'bg-[#141925] border-[#273049] hover:border-[var(--color-primary)]/50'
                      : 'bg-[#141925]/40 border-[#273049]/40 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-[#F2F5FA] truncate">
                        {sched.name}
                      </h4>
                      {sched.ultraFocus && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 uppercase shrink-0">
                          PRO
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-[var(--color-primary)]">
                      {formatTime(sched.from)} - {formatTime(sched.to)}
                    </p>

                    <div className="flex items-center gap-2.5 text-[11px] text-[#8B95AD] pt-0.5">
                      <span className="flex items-center gap-1">
                        <Shield size={11} className="text-teal-400" />
                        {sched.blockedAppIds.length} blocked
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Coffee size={11} className="text-amber-400" />
                        {sched.breaks.count} breaks
                      </span>
                    </div>
                  </div>

                  {/* Switch toggle */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSchedule(sched.id);
                    }}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Action: "Create Schedule" Button (Hidden on tablet where top bar button is used) */}
      <div className="sm:hidden sticky bottom-20 z-20 pt-4 flex justify-center">
        <button
          onClick={handleCreateNew}
          className="w-full max-w-sm h-14 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full font-display font-semibold text-base shadow-[0_12px_36px_rgba(255,255,255,0.18)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={2.8} />
          <span>Create Schedule</span>
        </button>
      </div>
    </div>
  );
};
