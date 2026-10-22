import React, { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  ChevronDown,
  Shield,
  Zap,
  Check,
  Smartphone,
  Trash2,
  Bell,
  Clock,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Schedule } from '../types';
import { AppPickerModal } from '../components/AppPickerModal';
import { nativeBridge } from '../services/NativeBridge';

export const CreateScheduleScreen: React.FC = () => {
  const {
    editingSchedule,
    saveSchedule,
    deleteSchedule,
    setShowCreateSchedule,
    setEditingSchedule,
    profile,
    openPaywall,
  } = useApp();

  const [name, setName] = useState(editingSchedule?.name || 'Morning Study');
  const [isEditingName, setIsEditingName] = useState(false);
  const [fromTime, setFromTime] = useState(editingSchedule?.from || '06:00');
  const [toTime, setToTime] = useState(editingSchedule?.to || '08:00');
  const [activeDays, setActiveDays] = useState<number[]>(editingSchedule?.days || [1, 2, 3, 4, 5]);

  // Alarm reminder
  const [reminderEnabled, setReminderEnabled] = useState(editingSchedule?.reminder.enabled ?? true);
  const [reminderLeadMin, setReminderLeadMin] = useState(editingSchedule?.reminder.leadMin ?? 5);
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  // Breaks
  const [breakLengthMin, setBreakLengthMin] = useState(editingSchedule?.breaks.lengthMin ?? 5);
  const [breakCount, setBreakCount] = useState(editingSchedule?.breaks.count ?? 3);
  const [showBreaksModal, setShowBreaksModal] = useState(false);

  // Blocked apps & Ultra focus
  const [blockedAppIds, setBlockedAppIds] = useState<string[]>(
    editingSchedule?.blockedAppIds || ['app_bytegram', 'app_cliptube', 'app_tokscroll', 'app_snapline']
  );
  const [isAppPickerOpen, setIsAppPickerOpen] = useState(false);
  const [ultraFocus, setUltraFocus] = useState(editingSchedule?.ultraFocus || false);

  const [validationError, setValidationError] = useState<string | null>(null);

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleDay = (dayIndex: number) => {
    if (activeDays.includes(dayIndex)) {
      if (activeDays.length === 1) return; // Keep at least one
      setActiveDays(activeDays.filter(d => d !== dayIndex));
    } else {
      setActiveDays([...activeDays, dayIndex]);
    }
  };

  const handleToggleUltraFocus = () => {
    nativeBridge.triggerHaptic('medium');
    setUltraFocus(!ultraFocus);
  };

  const handleSave = () => {
    // Validate
    if (activeDays.length === 0) {
      setValidationError('Please select at least one active day.');
      return;
    }

    const scheduleData: Schedule = {
      id: editingSchedule?.id || `sched_${Date.now()}`,
      name: name.trim() || 'Study Schedule',
      from: fromTime,
      to: toTime,
      days: activeDays,
      reminder: {
        enabled: reminderEnabled,
        leadMin: reminderLeadMin,
      },
      breaks: {
        lengthMin: breakLengthMin,
        count: breakCount,
      },
      blockedAppIds,
      ultraFocus,
      enabled: true,
    };

    saveSchedule(scheduleData);
  };

  const formatAmPm = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F2F5FA] p-4 sm:p-6 md:p-8 pb-28 w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex flex-col justify-between select-none animate-in fade-in duration-200">
      <div className="space-y-5">
        {/* Header matching screenshot #4: < Name ✏️ */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowCreateSchedule(false);
                setEditingSchedule(null);
              }}
              aria-label="Back"
              className="w-10 h-10 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#F2F5FA] hover:text-[var(--color-primary)] active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>

            {isEditingName ? (
              <input
                type="text"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="bg-[#1C2333] border border-[var(--color-primary)] rounded-xl px-3 py-1 text-base font-bold text-[#F2F5FA] focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-2 group text-left"
              >
                <h2 className="text-xl font-bold font-display text-[#F2F5FA] group-hover:text-[var(--color-primary)]">
                  {name}
                </h2>
                <Pencil size={15} className="text-[#8B95AD] group-hover:text-[var(--color-primary)]" />
              </button>
            )}
          </div>

          {editingSchedule && (
            <button
              onClick={() => {
                deleteSchedule(editingSchedule.id);
                setShowCreateSchedule(false);
                setEditingSchedule(null);
              }}
              aria-label="Delete schedule"
              className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Time Card: From & To */}
        <div className="bg-[#141925] border border-[#273049] rounded-[24px] p-5 space-y-4">
          {/* From */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B95AD]" />
              <span className="text-sm font-medium text-[#8B95AD]">From</span>
            </div>
            <div className="relative">
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
              <div className="px-4 py-2 rounded-2xl bg-[#1C2333] border border-[#273049] flex items-center gap-2 text-sm font-bold font-display">
                <span>{formatAmPm(fromTime)}</span>
                <ChevronDown size={14} className="text-[#8B95AD]" />
              </div>
            </div>
          </div>

          {/* Dotted connecting line */}
          <div className="border-l border-dashed border-[#273049] ml-1.5 h-3 -my-2" />

          {/* To */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#8B95AD]" />
              <span className="text-sm font-medium text-[#8B95AD]">To</span>
            </div>
            <div className="relative">
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
              <div className="px-4 py-2 rounded-2xl bg-[#1C2333] border border-[#273049] flex items-center gap-2 text-sm font-bold font-display">
                <span>{formatAmPm(toTime)}</span>
                <ChevronDown size={14} className="text-[#8B95AD]" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Days Strip */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#8B95AD] uppercase tracking-wider block">
            Active days
          </span>
          <div className="flex justify-between bg-[#141925] border border-[#273049] rounded-2xl p-2.5">
            {dayLetters.map((letter, idx) => {
              const isSelected = activeDays.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-[#1C2333] text-[#8B95AD] border border-transparent'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alarm Reminder Card */}
        <div className="bg-[#141925] border border-[#273049] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center shadow-md text-white font-serif text-lg font-bold">
              “
            </div>
            <div>
              <span className="text-sm font-bold text-[#F2F5FA] block">
                Alarm Reminder
              </span>
              <button
                onClick={() => setShowReminderSettings(!showReminderSettings)}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Change ({reminderLeadMin === 0 ? 'At start' : `${reminderLeadMin} min before`})
              </button>
            </div>
          </div>

          <div
            onClick={() => setReminderEnabled(!reminderEnabled)}
            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${
              reminderEnabled ? 'bg-emerald-400' : 'bg-[#273049]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-neutral-950 shadow-md transform transition-transform ${
                reminderEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Breaks Selector Row */}
        <div
          onClick={() => setShowBreaksModal(true)}
          className="bg-[#141925] border border-[#273049] rounded-[24px] p-4 flex items-center justify-between cursor-pointer hover:border-[#273049]/90"
        >
          <span className="text-sm font-semibold text-[#F2F5FA]">Breaks</span>
          <div className="flex items-center gap-1.5 text-xs text-[#8B95AD]">
            <span>{breakLengthMin} min · {breakCount} breaks</span>
            <ChevronDown size={14} className="-rotate-90" />
          </div>
        </div>

        {/* Two Tiles Side-by-Side: Blocked Apps & Ultra Focus */}
        <div className="grid grid-cols-2 gap-3">
          {/* Blocked Apps Tile */}
          <div
            onClick={() => setIsAppPickerOpen(true)}
            className="bg-[#141925] border border-[#273049] hover:border-teal-500/40 rounded-[24px] p-4 flex flex-col justify-between h-36 cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-6 w-6 rounded-full bg-pink-500 border border-[#141925]" />
                <span className="inline-block h-6 w-6 rounded-full bg-red-500 border border-[#141925]" />
                <span className="inline-block h-6 w-6 rounded-full bg-amber-400 border border-[#141925]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1C2333] text-[#8B95AD] inline-block">
                {blockedAppIds.length} apps
              </span>
              <span className="text-sm font-bold text-[#F2F5FA] block">
                Blocked apps
              </span>
            </div>
          </div>

          {/* Ultra Focus (PRO) Tile */}
          <div
            onClick={handleToggleUltraFocus}
            className={`rounded-[24px] p-4 flex flex-col justify-between h-36 cursor-pointer transition-all relative overflow-hidden active:scale-[0.98] ${
              ultraFocus
                ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20'
                : 'bg-amber-400/90 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            {/* Background lightning bolt watermark */}
            <Zap className="absolute -right-3 -bottom-3 text-neutral-950/15 w-24 h-24" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-neutral-950 text-emerald-400 uppercase tracking-wider">
                INCLUDED
              </span>
              {ultraFocus && (
                <div className="w-5 h-5 rounded-full bg-neutral-950 text-amber-400 flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="relative z-10">
              <span className="text-sm font-bold block">
                Ultra focus
              </span>
              <p className="text-[11px] text-neutral-800 leading-tight mt-0.5">
                {ultraFocus ? 'Active: complete lockdown' : 'Achieve non stop focus'}
              </p>
            </div>
          </div>
        </div>

        {validationError && (
          <p className="text-xs text-rose-400 text-center font-medium">
            {validationError}
          </p>
        )}
      </div>

      {/* Sticky Save Button at Bottom */}
      <div className="sticky bottom-6 z-20 pt-4 flex justify-center">
        <button
          onClick={handleSave}
          className="w-full max-w-sm h-14 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full font-display font-bold text-base shadow-[0_12px_36px_rgba(255,255,255,0.18)] transition-all active:scale-[0.98]"
        >
          Save
        </button>
      </div>

      {/* Breaks Modal */}
      {showBreaksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#141925] border border-[#273049] rounded-3xl p-5 space-y-4">
            <h4 className="text-base font-bold font-display text-[#F2F5FA]">
              Configure Routine Breaks
            </h4>

            <div className="space-y-2">
              <label className="text-xs text-[#8B95AD]">Break Length: {breakLengthMin} mins</label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={breakLengthMin}
                onChange={(e) => setBreakLengthMin(parseInt(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#8B95AD]">Number of Breaks: {breakCount}</label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={breakCount}
                onChange={(e) => setBreakCount(parseInt(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>

            <button
              onClick={() => setShowBreaksModal(false)}
              className="w-full py-2.5 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-xs rounded-full"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* App Picker Modal */}
      <AppPickerModal
        isOpen={isAppPickerOpen}
        onClose={() => setIsAppPickerOpen(false)}
        selectedAppIds={blockedAppIds}
        onConfirm={setBlockedAppIds}
        title="Block Apps for this Schedule"
      />
    </div>
  );
};
