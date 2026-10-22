import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Calendar,
  Clock,
  Flame,
  Award,
  HelpCircle,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CircularProgress } from '../components/CircularProgress';
import { EditGoalModal } from '../components/EditGoalModal';

export const StatsScreen: React.FC = () => {
  const {
    setShowStatsScreen,
    sessions,
    goals,
    tags,
    deleteSession,
    profile,
  } = useApp();

  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = today, -1 = yesterday, etc.
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Current targeted date
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    return d;
  }, [selectedDayOffset]);

  // Format time helpers
  const formatTimeHM = (min: number) => {
    if (min === 0) return '0m';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Filter sessions for target day
  const dayStart = new Date(targetDate).setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999);

  const daySessions = useMemo(() => {
    return sessions.filter(s => s.completed && s.start >= dayStart && s.start <= dayEnd);
  }, [sessions, dayStart, dayEnd]);

  const dayTotalMin = useMemo(() => {
    return daySessions.reduce((acc, s) => acc + s.durationMin, 0);
  }, [daySessions]);

  // Tags distribution for day
  const tagBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    daySessions.forEach(s => {
      map.set(s.tagId, (map.get(s.tagId) || 0) + s.durationMin);
    });
    return Array.from(map.entries()).map(([tagId, minutes]) => {
      const tagObj = tags.find(t => t.id === tagId) || { id: tagId, name: 'General', color: '#5EEAD4' };
      const pct = dayTotalMin > 0 ? Math.round((minutes / dayTotalMin) * 100) : 0;
      return { tag: tagObj, minutes, pct };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [daySessions, tags, dayTotalMin]);

  // Week sessions calculation
  const weekSessions = useMemo(() => {
    const now = new Date();
    const currDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currDay + (selectedWeekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return sessions.filter(s => s.completed && s.start >= startOfWeek.getTime() && s.start < endOfWeek.getTime());
  }, [sessions, selectedWeekOffset]);

  const weekTotalMin = useMemo(() => {
    return weekSessions.reduce((acc, s) => acc + s.durationMin, 0);
  }, [weekSessions]);

  const weekDailyAvgMin = Math.round(weekTotalMin / 7);

  // Month data calculation
  const monthDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const monthYear = monthDate.getFullYear();
  const monthIdx = monthDate.getMonth();
  const monthName = monthDate.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(monthYear, monthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(monthYear, monthIdx, 1).getDay();

  const monthSessions = useMemo(() => {
    const mStart = new Date(monthYear, monthIdx, 1, 0, 0, 0).getTime();
    const mEnd = new Date(monthYear, monthIdx + 1, 0, 23, 59, 59).getTime();
    return sessions.filter(s => s.completed && s.start >= mStart && s.start <= mEnd);
  }, [sessions, monthYear, monthIdx]);

  const monthTotalMin = useMemo(() => {
    return monthSessions.reduce((acc, s) => acc + s.durationMin, 0);
  }, [monthSessions]);

  // Build calendar matrix
  const calendarCells = useMemo(() => {
    const cells: { day: number | null; min: number; isToday: boolean }[] = [];
    const today = new Date();
    // Empty prefix cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ day: null, min: 0, isToday: false });
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dStart = new Date(monthYear, monthIdx, d, 0, 0, 0).getTime();
      const dEnd = new Date(monthYear, monthIdx, d, 23, 59, 59).getTime();
      const totalMinForDay = sessions
        .filter(s => s.completed && s.start >= dStart && s.start <= dEnd)
        .reduce((sum, s) => sum + s.durationMin, 0);
      const isToday = today.getDate() === d && today.getMonth() === monthIdx && today.getFullYear() === monthYear;
      cells.push({ day: d, min: totalMinForDay, isToday });
    }
    return cells;
  }, [daysInMonth, firstDayOfWeek, monthYear, monthIdx, sessions]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F2F5FA] p-5 pb-24 max-w-md mx-auto select-none space-y-6 animate-in fade-in duration-200">
      {/* Top Header matching screenshots: < Today / This week / This month + Help */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setShowStatsScreen(false)}
          aria-label="Back to Focus"
          className="flex items-center gap-2 text-sm font-semibold text-[#F2F5FA] hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
          <span>
            {period === 'day' ? 'Today' : period === 'week' ? 'This week' : 'This month'}
          </span>
        </button>

        <button
          onClick={() => showToast('Analytics calculate exact foreground focus and compare against your weekly targets.')}
          className="flex items-center gap-1 text-xs text-[#8B95AD] bg-[#141925] border border-[#273049] px-3 py-1.5 rounded-full hover:text-white"
        >
          <HelpCircle size={14} />
          <span>Help</span>
        </button>
      </div>

      {/* Segmented Control: Day | Week | Month */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#141925] border border-[#273049] rounded-2xl">
        {(['day', 'week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
              period === p
                ? 'bg-[#1C2333] text-[#F2F5FA] shadow-sm font-bold'
                : 'text-[#8B95AD] hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 max-w-sm mx-auto z-50 bg-[#1C2333] border border-[var(--color-primary)] text-xs text-center p-3 rounded-2xl shadow-2xl animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* ================= DAY VIEW ================= */}
      {period === 'day' && (
        <div className="space-y-6">
          {/* Weekday strip matching screenshot #9 */}
          <div className="flex justify-between items-center bg-[#141925] border border-[#273049] rounded-2xl p-2.5">
            {dayLetters.map((d, idx) => {
              const currentTargetDay = targetDate.getDay();
              const isSelected = currentTargetDay === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayOffset(idx - new Date().getDay())}
                  className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                      : 'text-[#8B95AD] hover:text-white'
                  }`}
                >
                  <span className="text-xs">{d}</span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full mt-1 border flex items-center justify-center ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-400/20'
                        : 'border-[#273049] bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Big Circular Progress */}
          <div className="flex flex-col items-center justify-center py-2">
            <CircularProgress
              progress={goals.dailyMin > 0 ? dayTotalMin / goals.dailyMin : 0}
              size={240}
              strokeWidth={22}
              showTopArrow={true}
              accentColor="var(--color-primary)"
            >
              <div className="space-y-1">
                <span className="font-display font-bold text-4xl text-[#F2F5FA] tabular-nums">
                  {formatTimeHM(dayTotalMin)}
                </span>
                <span className="text-xs text-[#8B95AD] block font-medium">
                  Focus goal {Math.round(goals.dailyMin / 60)}h
                </span>
              </div>
            </CircularProgress>

            {/* Edit Goal Pill */}
            <button
              onClick={() => setIsEditGoalOpen(true)}
              className="mt-4 px-4 py-1.5 bg-[#141925] border border-[#273049] hover:border-[var(--color-primary)] text-xs font-semibold text-[#F2F5FA] rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Pencil size={13} className="text-[var(--color-primary)]" />
              <span>Edit Goal</span>
            </button>
          </div>

          {/* 24-Hour Timeline Bar matching screenshot #9 */}
          <div className="bg-[#141925] border border-[#273049] rounded-[24px] p-5 space-y-3">
            <span className="text-sm font-bold text-[#F2F5FA] block">
              Today's summary
            </span>

            {/* Visual 24h bar */}
            <div className="w-full h-3 rounded-full bg-[#1C2333] relative overflow-hidden flex">
              {daySessions.map(s => {
                const startHour = new Date(s.start).getHours() + new Date(s.start).getMinutes() / 60;
                const durHours = s.durationMin / 60;
                const leftPercent = (startHour / 24) * 100;
                const widthPercent = Math.max(1.5, (durHours / 24) * 100);
                const tag = tags.find(t => t.id === s.tagId);
                return (
                  <div
                    key={s.id}
                    className="absolute top-0 bottom-0 rounded-full"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: tag?.color || '#5EEAD4'
                    }}
                    title={`${tag?.name || 'Focus'}: ${s.durationMin}m`}
                  />
                );
              })}
            </div>

            {/* Hour ticks */}
            <div className="flex justify-between text-[10px] text-[#8B95AD]">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </div>
          </div>

          {/* Tags breakdown */}
          <div className="bg-[#141925] border border-[#273049] rounded-[24px] p-5 space-y-3">
            <span className="text-sm font-bold text-[#F2F5FA] block">
              Tags
            </span>

            {tagBreakdown.length === 0 ? (
              <p className="text-xs text-[#8B95AD]">No sessions yet today</p>
            ) : (
              <div className="space-y-2.5">
                {tagBreakdown.map(item => (
                  <div key={item.tag.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.tag.color }} />
                        <span className="font-semibold text-[#F2F5FA]">{item.tag.name}</span>
                      </div>
                      <span className="text-[#8B95AD]">{formatTimeHM(item.minutes)} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1C2333] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, backgroundColor: item.tag.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className="bg-[#141925] border border-[#273049] rounded-[24px] p-5 space-y-3">
            <span className="text-sm font-bold text-[#F2F5FA] block">
              Sessions ({daySessions.length})
            </span>

            {daySessions.length === 0 ? (
              <p className="text-xs text-[#8B95AD]">No sessions recorded yet</p>
            ) : (
              <div className="space-y-2">
                {daySessions.map(s => {
                  const tag = tags.find(t => t.id === s.tagId);
                  const startTimeStr = new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTimeStr = new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={s.id}
                      className="p-3 bg-[#1C2333]/50 rounded-2xl border border-[#273049] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag?.color || '#5EEAD4' }} />
                          <span className="text-xs font-bold text-[#F2F5FA]">{tag?.name || 'Study'}</span>
                          <span className="text-[10px] text-[#8B95AD] capitalize">({s.mode})</span>
                        </div>
                        <p className="text-[11px] text-[#8B95AD]">
                          {startTimeStr} - {endTimeStr}
                        </p>
                        {s.note && (
                          <p className="text-[11px] text-teal-300 italic pt-0.5">"{s.note}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold font-display text-[var(--color-primary)]">
                          {s.durationMin}m
                        </span>
                        <button
                          onClick={() => deleteSession(s.id)}
                          aria-label="Delete session"
                          className="text-[#8B95AD] hover:text-rose-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= WEEK VIEW ================= */}
      {period === 'week' && (
        <div className="space-y-6">
          {/* Week Navigator matching screenshot #5 */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setSelectedWeekOffset(o => o - 1)}
              className="w-8 h-8 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#8B95AD] hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold font-display text-[#F2F5FA]">
              {selectedWeekOffset === 0 ? 'This Week' : `${selectedWeekOffset} Weeks Ago`}
            </span>
            <button
              onClick={() => setSelectedWeekOffset(o => Math.min(0, o + 1))}
              disabled={selectedWeekOffset >= 0}
              className={`w-8 h-8 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#8B95AD] ${
                selectedWeekOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-white'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 7 Daily Rings Strip */}
          <div className="flex justify-between bg-[#141925] border border-[#273049] rounded-2xl p-2.5">
            {dayLetters.map((letter, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[11px] text-[#8B95AD] mb-1">{letter}</span>
                <div className="w-8 h-8 rounded-full border border-[#273049] flex items-center justify-center bg-[#1C2333]">
                  <div className="w-3.5 h-3.5 rounded-full border border-teal-500/50" />
                </div>
              </div>
            ))}
          </div>

          {/* Week Goal Circular Progress */}
          <div className="flex flex-col items-center justify-center py-2">
            <CircularProgress
              progress={goals.weeklyMin > 0 ? weekTotalMin / goals.weeklyMin : 0}
              size={240}
              strokeWidth={22}
              showTopArrow={true}
              accentColor="var(--color-primary)"
            >
              <div className="space-y-1">
                <span className="font-display font-bold text-4xl text-[#F2F5FA] tabular-nums">
                  {formatTimeHM(weekTotalMin)}
                </span>
                <span className="text-xs text-[#8B95AD] block font-medium">
                  Week goal {Math.round(goals.weeklyMin / 60)}h
                </span>
              </div>
            </CircularProgress>

            {/* Daily Avg */}
            <div className="mt-5 text-center">
              <span className="text-2xl font-bold font-display text-[#F2F5FA] block">
                {formatTimeHM(weekDailyAvgMin)}
              </span>
              <span className="text-xs text-[#8B95AD]">Daily average</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= MONTH VIEW ================= */}
      {period === 'month' && (
        <div className="space-y-6">
          {/* Month Navigator matching screenshot #6 */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setSelectedMonthOffset(o => o - 1)}
              className="w-8 h-8 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#8B95AD] hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-base font-bold font-display text-[#F2F5FA]">
              {monthName} {monthYear}
            </span>
            <button
              onClick={() => setSelectedMonthOffset(o => Math.min(0, o + 1))}
              disabled={selectedMonthOffset >= 0}
              className={`w-8 h-8 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#8B95AD] ${
                selectedMonthOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-white'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Calendar Heatmap Grid matching screenshot #6 */}
          <div className="bg-[#141925] border border-[#273049] rounded-[28px] p-5 space-y-4">
            {/* Weekday headers: S M T W T F S */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8B95AD]">
              {dayLetters.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-y-3 text-center">
              {calendarCells.map((cell, idx) => {
                if (!cell.day) {
                  return <div key={idx} />;
                }
                const hasFocus = cell.min > 0;
                return (
                  <div key={idx} className="flex flex-col items-center justify-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        cell.isToday
                          ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                          : hasFocus
                          ? 'bg-[#1C2333] text-[#F2F5FA] border border-[#273049]'
                          : 'text-[#8B95AD] opacity-50'
                      }`}
                    >
                      {cell.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month Total Focus */}
          <div className="text-center space-y-1">
            <span className="text-3xl font-bold font-display text-[#F2F5FA] block">
              {formatTimeHM(monthTotalMin)}
            </span>
            <span className="text-xs text-[#8B95AD]">Total focus this month</span>
          </div>

          {/* Add Calendar to Home Button matching screenshot #6 */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => showToast('Calendar widget pinned! (TODO native: AppWidgetProvider)')}
              className="px-5 py-3 rounded-full bg-[#141925] border border-[#273049] hover:border-[var(--color-primary)] text-xs font-bold text-[#F2F5FA] flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <Calendar size={15} />
              <span>Add calendar to home</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Goal modal */}
      <EditGoalModal
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
      />
    </div>
  );
};
