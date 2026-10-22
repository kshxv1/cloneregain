import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Lock,
  Shield,
  Volume2,
  VolumeX,
  Droplets,
  Heart,
  Eye,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { audioService } from '../services/AudioService';
import { nativeBridge } from '../services/NativeBridge';

export const ActiveSessionScreen: React.FC = () => {
  const {
    activeSession,
    pauseSession,
    resumeSession,
    endActiveSession,
    skipPomodoroPhase,
    tags,
    profile,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  // 5-second hold state for strict mode emergency exit
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh clock every second
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const currentTag = tags.find(t => t.id === activeSession.tagId) || tags[0];

  // Compute elapsed & remaining milliseconds based on timestamps to survive backgrounding/reloads
  const now = activeSession.isPaused && activeSession.pausedAt ? activeSession.pausedAt : currentTime;
  const elapsedMs = Math.max(0, now - activeSession.startedAt - activeSession.pausedDurationMs);
  const totalTargetMs = (activeSession.mode === 'pomodoro'
    ? (activeSession.pomodoroState?.phase === 'focus'
        ? (activeSession.pomodoroState.focusMin * 60 * 1000)
        : activeSession.pomodoroState?.phase === 'short_break'
        ? (activeSession.pomodoroState.shortBreakMin * 60 * 1000)
        : (activeSession.pomodoroState?.longBreakMin || 15) * 60 * 1000)
    : activeSession.targetDurationMin * 60 * 1000);

  const remainingMs = Math.max(0, totalTargetMs - elapsedMs);
  const isTimeUp = activeSession.mode !== 'stopwatch' && remainingMs <= 0;

  // Strict mode lock check
  const isStrictLocked = activeSession.strict && Date.now() < activeSession.strictUntil;
  const strictSecondsLeft = Math.max(0, Math.ceil((activeSession.strictUntil - Date.now()) / 1000));

  // Time formatting
  const formatTimerDigits = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const h = Math.floor(m / 60);
    if (h > 0) {
      const remM = m % 60;
      return `${h}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleSound = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      audioService.play(activeSession.ambientSound, activeSession.soundVolume);
    } else {
      setIsAudioMuted(true);
      audioService.stop();
    }
  };

  // Hold to exit handler
  const handleHoldStart = () => {
    if (!profile.emergencyExitAllowed) return;
    nativeBridge.triggerHaptic('light');
    let progress = 0;
    holdIntervalRef.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);
      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        nativeBridge.triggerHaptic('warning');
        endActiveSession(false);
      }
    }, 100);
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  const isBreak = activeSession.pomodoroState && activeSession.pomodoroState.phase !== 'focus';

  // Break micro-activity suggestions
  const breakSuggestions = [
    { icon: Droplets, title: 'Hydrate', desc: 'Drink a glass of fresh water' },
    { icon: Eye, title: '20-20-20 Rule', desc: 'Look at an object 20 feet away for 20 seconds' },
    { icon: Heart, title: 'Gentle Stretch', desc: 'Roll shoulders back, relax neck tension' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E14] text-[#F2F5FA] flex flex-col justify-between p-6 select-none animate-in fade-in duration-300 overflow-hidden">
      {/* Background breathing water glow */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          activeSession.isPaused ? 'opacity-20' : 'animate-breathe'
        }`}
      >
        <div
          className="w-96 h-96 rounded-full blur-[100px] opacity-15"
          style={{ backgroundColor: isBreak ? '#34D399' : currentTag.color }}
        />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141925]/80 border border-[#273049] backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTag.color }} />
          <span className="text-xs font-semibold">{currentTag.name}</span>
          {activeSession.strict && (
            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-bold ml-1">
              <Lock size={12} />
              Strict
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeSession.ambientSound !== 'None' && (
            <button
              onClick={handleToggleSound}
              aria-label="Toggle ambient sound"
              className="w-10 h-10 rounded-full bg-[#141925] border border-[#273049] flex items-center justify-center text-[#8B95AD] hover:text-white"
            >
              {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          {activeSession.blockApps && (
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400" title="Distractions blocked">
              <Shield size={18} />
            </div>
          )}
        </div>
      </div>

      {/* Center Stage: Timer & Breathing Circle */}
      <div className="relative my-auto flex flex-col items-center justify-center text-center z-10 space-y-6">
        {/* Phase label */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-[#8B95AD]">
            {activeSession.mode === 'stopwatch'
              ? 'Open Flow'
              : activeSession.pomodoroState
              ? (activeSession.pomodoroState.phase === 'focus'
                  ? `Focus Phase • Cycle ${activeSession.pomodoroState.currentCycle}/${activeSession.pomodoroState.cyclesBeforeLong}`
                  : `Rest & Refresh • ${activeSession.pomodoroState.phase === 'long_break' ? 'Long Break' : 'Short Break'}`)
              : 'Deep Focus'}
          </span>
          {activeSession.isPaused && (
            <span className="block text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full w-fit mx-auto">
              Session Paused
            </span>
          )}
        </div>

        {/* Breathing Ring & Giant Numerals */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Subtle concentric ripples */}
          <div className="absolute inset-0 rounded-full border border-[var(--color-primary)]/10 animate-water-pulse" />
          <div className="absolute inset-4 rounded-full border border-[var(--color-primary)]/20" />
          <div className="absolute inset-8 rounded-full bg-[#141925]/70 backdrop-blur-xl border border-[#273049]/60 shadow-2xl flex flex-col items-center justify-center" />

          <div className="relative z-10 flex flex-col items-center">
            <span className="font-display font-bold text-6xl sm:text-7xl tracking-tighter text-[#F2F5FA] tabular-nums">
              {activeSession.mode === 'stopwatch'
                ? formatTimerDigits(elapsedMs)
                : formatTimerDigits(remainingMs)}
            </span>
            <span className="text-xs text-[#8B95AD] mt-2 font-medium">
              {activeSession.mode === 'stopwatch'
                ? `${Math.floor(elapsedMs / 60000)}m recorded`
                : `${Math.round(totalTargetMs / 60000)}m target`}
            </span>
          </div>
        </div>

        {/* Break Phase Activity Suggestion */}
        {isBreak && (
          <div className="w-full max-w-xs bg-[#141925]/90 border border-emerald-500/30 rounded-2xl p-3.5 text-left animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Mindful Micro-Break</span>
            </div>
            <p className="text-xs text-[#8B95AD]">
              Step away from screens. Relax your gaze and let your subconscious organize newly acquired knowledge.
            </p>
          </div>
        )}

        {/* Strict mode warning indicator */}
        {isStrictLocked && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400/90 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full">
            <Lock size={13} />
            <span>Strict lock active • {Math.floor(strictSecondsLeft / 60)}m {strictSecondsLeft % 60}s remaining</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm mx-auto z-10 space-y-4">
        <div className="flex items-center justify-center gap-4">
          {/* Pause / Resume button */}
          <button
            onClick={activeSession.isPaused ? resumeSession : pauseSession}
            className="w-14 h-14 rounded-full bg-[#1C2333] hover:bg-[#273049] border border-[#273049] flex items-center justify-center text-[#F2F5FA] active:scale-95 transition-all shadow-lg"
            aria-label={activeSession.isPaused ? 'Resume session' : 'Pause session'}
          >
            {activeSession.isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} />}
          </button>

          {/* Pomodoro Skip phase button */}
          {activeSession.mode === 'pomodoro' && (
            <button
              onClick={skipPomodoroPhase}
              className="w-14 h-14 rounded-full bg-[#1C2333] hover:bg-[#273049] border border-[#273049] flex items-center justify-center text-[#F2F5FA] active:scale-95 transition-all shadow-lg"
              title="Skip phase"
              aria-label="Skip to next Pomodoro phase"
            >
              <RotateCcw size={20} />
            </button>
          )}

          {/* End Session button */}
          {isStrictLocked ? (
            <div className="flex flex-col items-center">
              {profile.emergencyExitAllowed ? (
                <button
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                  className="relative w-14 h-14 rounded-full bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400 overflow-hidden active:scale-95 transition-all"
                  aria-label="Hold 5 seconds to emergency exit"
                >
                  {/* Circular hold progress fill */}
                  <div
                    className="absolute inset-0 bg-rose-600/40 transition-all"
                    style={{ height: `${holdProgress}%` }}
                  />
                  <AlertTriangle size={20} className="relative z-10" />
                </button>
              ) : (
                <div
                  className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 cursor-not-allowed"
                  title="Unlocks when timer completes"
                >
                  <Lock size={20} />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (isTimeUp) {
                  endActiveSession(true);
                } else {
                  setShowConfirmEnd(true);
                }
              }}
              className="w-14 h-14 rounded-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 active:scale-95 transition-all shadow-lg"
              aria-label="End session"
            >
              <Square size={20} fill="currentColor" />
            </button>
          )}
        </div>

        {isStrictLocked && profile.emergencyExitAllowed && (
          <p className="text-[11px] text-center text-[#8B95AD]">
            Hold red button 5 seconds for emergency exit
          </p>
        )}
      </div>

      {/* Confirm End Modal for normal mode */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-[#141925] border border-[#273049] rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <h4 className="text-base font-bold font-display text-[#F2F5FA]">
              End study session?
            </h4>
            <p className="text-xs text-[#8B95AD]">
              Your focused minutes up to now will be saved to your daily stats.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 py-2.5 rounded-full bg-[#1C2333] text-xs font-semibold text-[#F2F5FA] hover:bg-[#273049]"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowConfirmEnd(false);
                  endActiveSession(true);
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-500 text-xs font-bold text-white hover:bg-rose-400"
              >
                End & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
