import React, { useState } from 'react';
import { Check, Flame, Trophy, FileText, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const SessionSummaryModal: React.FC = () => {
  const {
    recentCompletedSession,
    setRecentCompletedSession,
    tags,
    saveSessionNote,
    goals,
    todayFocusedMinutes,
    profile,
  } = useApp();

  const [note, setNote] = useState('');

  if (!recentCompletedSession) return null;

  const tag = tags.find(t => t.id === recentCompletedSession.tagId) || tags[0];
  const goalPercent = Math.min(100, Math.round((todayFocusedMinutes / goals.dailyMin) * 100));

  const handleSave = () => {
    if (note.trim()) {
      saveSessionNote(recentCompletedSession.id, note.trim());
    }
    setRecentCompletedSession(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#141925] border border-[#273049] rounded-[32px] p-6 shadow-2xl space-y-5 text-center">
        {/* Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
          <Check size={32} strokeWidth={3} />
        </div>

        <div>
          <h3 className="text-2xl font-bold font-display text-[#F2F5FA]">
            Stillness Achieved
          </h3>
          <p className="text-xs text-[#8B95AD] mt-1">
            Excellent discipline. Your focused time was logged.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-[#1C2333]/60 border border-[#273049] rounded-2xl p-3.5">
          <div>
            <span className="text-[11px] text-[#8B95AD] block font-medium">Focused</span>
            <span className="text-lg font-bold font-display text-[#F2F5FA]">
              {recentCompletedSession.durationMin}m
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#8B95AD] block font-medium">Tag</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 truncate max-w-full" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
              {tag.name}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#8B95AD] block font-medium">Streak</span>
            <span className="text-lg font-bold font-display text-amber-400 flex items-center justify-center gap-0.5">
              <Flame size={15} />
              {profile.streak}d
            </span>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="space-y-1.5 text-left bg-[#1C2333]/40 p-3 rounded-2xl border border-[#273049]/60">
          <div className="flex justify-between text-xs">
            <span className="text-[#8B95AD]">Daily Target ({Math.round(goals.dailyMin / 60)}h)</span>
            <span className="font-bold text-[var(--color-primary)]">{goalPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0B0E14] overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-700"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        {/* Reflection Note */}
        <div className="text-left space-y-1.5">
          <label className="text-xs font-semibold text-[#8B95AD] flex items-center gap-1.5">
            <FileText size={13} />
            Study note or reflection (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Finished Problem Set 4, reviewed chapter 8"
            className="w-full bg-[#1C2333] border border-[#273049] rounded-xl px-3.5 py-2 text-xs text-[#F2F5FA] placeholder-[#8B95AD] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-white text-neutral-950 font-bold text-sm rounded-full transition-transform active:scale-95 shadow-lg"
        >
          Save & Return Home
        </button>
      </div>
    </div>
  );
};
