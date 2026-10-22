import React, { useState } from 'react';
import {
  X,
  Play,
  Lock,
  Shield,
  Volume2,
  Tag as TagIcon,
  Plus,
  Clock,
  RotateCcw,
  Timer as TimerIcon,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { SessionMode, Tag } from '../types';

export const StartSessionModal: React.FC = () => {
  const {
    showStartSessionModal,
    setShowStartSessionModal,
    tags,
    addTag,
    startSession,
    profile,
    openPaywall,
  } = useApp();

  const [mode, setMode] = useState<SessionMode>('timer');
  const [durationMin, setDurationMin] = useState(25);
  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || 'tag_study');
  const [strict, setStrict] = useState(false);
  const [blockApps, setBlockApps] = useState(true);
  const [ambientSound, setAmbientSound] = useState('Rain');
  const [volume, setVolume] = useState(0.6);

  // Pomodoro config
  const [pomodoroConfig, setPomodoroConfig] = useState({
    focusMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    cyclesBeforeLong: 4,
  });

  // Custom tag creation
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#5EEAD4');

  if (!showStartSessionModal) return null;

  const quickDurations = [25, 45, 60, 90, 120];
  const ambientSounds = ['None', 'Rain', 'Brown noise', 'Waves', 'Lo-fi', 'Library'];
  const tagColors = ['#5EEAD4', '#A78BFA', '#38BDF8', '#FBBF24', '#F43F5E', '#34D399', '#FB923C'];

  const handleStart = () => {
    startSession({
      mode,
      durationMin: mode === 'pomodoro' ? pomodoroConfig.focusMin : durationMin,
      tagId: selectedTagId,
      strict,
      blockApps,
      ambientSound,
      soundVolume: volume,
      pomodoroConfig: mode === 'pomodoro' ? pomodoroConfig : undefined,
    });
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const tag: Tag = {
      id: `tag_${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
    };
    addTag(tag);
    setSelectedTagId(tag.id);
    setNewTagName('');
    setIsCreatingTag(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#273049]/60">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-display text-[#F2F5FA]">
              Start Focus Session
            </span>
          </div>
          <button
            onClick={() => setShowStartSessionModal(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Segmented Mode Control: Timer | Stopwatch | Pomodoro */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#1C2333] border border-[#273049] rounded-2xl">
            <button
              onClick={() => setMode('timer')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                mode === 'timer'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-md'
                  : 'text-[#8B95AD] hover:text-white'
              }`}
            >
              <TimerIcon size={14} />
              <span>Timer</span>
            </button>
            <button
              onClick={() => setMode('stopwatch')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                mode === 'stopwatch'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-md'
                  : 'text-[#8B95AD] hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>Stopwatch</span>
            </button>
            <button
              onClick={() => setMode('pomodoro')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                mode === 'pomodoro'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-md'
                  : 'text-[#8B95AD] hover:text-white'
              }`}
            >
              <RotateCcw size={14} />
              <span>Pomodoro</span>
            </button>
          </div>

          {/* Mode-specific configuration */}
          {mode === 'timer' && (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#8B95AD] uppercase font-semibold tracking-wider">
                  Session Length
                </span>
                <span className="font-display font-bold text-2xl text-[var(--color-primary)]">
                  {durationMin} min
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="5"
                max="240"
                step="5"
                value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value))}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />

              {/* Quick chip buttons */}
              <div className="flex gap-2">
                {quickDurations.map(m => (
                  <button
                    key={m}
                    onClick={() => setDurationMin(m)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      durationMin === m
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]'
                        : 'bg-[#1C2333] text-[#8B95AD] border border-[#273049] hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'stopwatch' && (
            <div className="p-4 bg-[#1C2333]/50 border border-[#273049] rounded-2xl text-center space-y-1">
              <p className="text-sm font-semibold text-[#F2F5FA]">
                Open-Ended Count Up
              </p>
              <p className="text-xs text-[#8B95AD]">
                Ideal for uninterrupted deep immersion without a fixed deadline.
              </p>
            </div>
          )}

          {mode === 'pomodoro' && (
            <div className="space-y-3.5 bg-[#1C2333]/40 border border-[#273049] p-4 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8B95AD]">
                <span>Focus: {pomodoroConfig.focusMin}m</span>
                <span>Break: {pomodoroConfig.shortBreakMin}m</span>
                <span>Long: {pomodoroConfig.longBreakMin}m</span>
                <span>4 Cycles</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(c => (
                  <div key={c} className="flex-1 flex items-center gap-1">
                    <div className="h-2 flex-1 rounded-full bg-[var(--color-primary)]" title={`Cycle ${c} Focus`} />
                    <div className="h-2 w-3 rounded-full bg-emerald-400" title={`Cycle ${c} Break`} />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-[#8B95AD]">Interval Presets:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPomodoroConfig({ focusMin: 25, shortBreakMin: 5, longBreakMin: 15, cyclesBeforeLong: 4 })}
                    className="px-2.5 py-1 rounded-lg bg-[#141925] border border-[#273049] text-xs text-[#F2F5FA] hover:border-[var(--color-primary)]"
                  >
                    25/5
                  </button>
                  <button
                    onClick={() => setPomodoroConfig({ focusMin: 50, shortBreakMin: 10, longBreakMin: 25, cyclesBeforeLong: 4 })}
                    className="px-2.5 py-1 rounded-lg bg-[#141925] border border-[#273049] text-xs text-[#F2F5FA] hover:border-[var(--color-primary)]"
                  >
                    50/10
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tag Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B95AD] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <TagIcon size={13} />
                Activity Tag
              </span>
              <button
                onClick={() => setIsCreatingTag(!isCreatingTag)}
                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>New tag</span>
              </button>
            </div>

            {isCreatingTag && (
              <div className="p-3 bg-[#1C2333] border border-[#273049] rounded-2xl space-y-2 animate-in fade-in duration-200">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name (e.g. Physics, GRE, Essay)"
                  className="w-full bg-[#141925] border border-[#273049] rounded-xl px-3 py-1.5 text-xs text-[#F2F5FA] focus:outline-none focus:border-[var(--color-primary)]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {tagColors.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewTagColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          newTagColor === c ? 'scale-125 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleCreateTag}
                    className="px-3 py-1 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-xs rounded-full"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tags.map(t => {
                const isSelected = selectedTagId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTagId(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border shadow-md'
                        : 'bg-[#1C2333]/80 text-[#8B95AD] border border-[#273049]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${t.color}20` : undefined,
                      borderColor: isSelected ? t.color : undefined,
                      color: isSelected ? t.color : undefined,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Enforcements & Toggles */}
          <div className="space-y-2.5">
            {/* Strict Mode */}
            <div className="flex items-center justify-between p-3.5 bg-[#1C2333]/60 border border-[#273049] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F2F5FA] block">Strict mode</span>
                  <span className="text-[11px] text-[#8B95AD] block">
                    Blocks session exit until target time expires
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={strict}
                onChange={(e) => setStrict(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            {/* Block Apps */}
            <div className="flex items-center justify-between p-3.5 bg-[#1C2333]/60 border border-[#273049] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F2F5FA] block">Block distraction apps</span>
                  <span className="text-[11px] text-[#8B95AD] block">
                    Locks social feeds & selected restricted apps
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={blockApps}
                onChange={(e) => setBlockApps(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            {/* Ambient Soundscape */}
            <div className="p-3.5 bg-[#1C2333]/60 border border-[#273049] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Volume2 size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#F2F5FA] block">Ambient Soundscape</span>
                    <span className="text-[11px] text-[#8B95AD] block">Science-backed procedural sound</span>
                  </div>
                </div>
                <select
                  value={ambientSound}
                  onChange={(e) => setAmbientSound(e.target.value)}
                  className="bg-[#141925] border border-[#273049] rounded-xl px-2.5 py-1 text-xs text-[#F2F5FA] focus:outline-none"
                >
                  {ambientSounds.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {ambientSound !== 'None' && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-[#8B95AD]">Vol</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-[var(--color-primary)]"
                  />
                  <span className="text-[11px] text-[#8B95AD] w-7 text-right">{Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#273049] bg-[#141925]">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-base rounded-full transition-transform active:scale-95 shadow-xl flex items-center justify-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            <span>Begin Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
