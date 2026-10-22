import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ActiveSession,
  AppLimit,
  BlockConfig,
  Goals,
  Schedule,
  Session,
  Tag,
  ThemeMode,
  AccentTheme,
  UserProfile,
} from '../types';
import {
  DEFAULT_APP_LIMITS,
  DEFAULT_BLOCK_CONFIG,
  DEFAULT_GOALS,
  DEFAULT_PROFILE,
  DEFAULT_TAGS,
  generateSeedSessions,
  SUGGESTED_SCHEDULES,
} from '../utils/demoData';
import { storage } from '../services/storage';
import { nativeBridge } from '../services/NativeBridge';
import { audioService } from '../services/AudioService';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Navigation
  activeTab: 'focus' | 'plan' | 'rooms' | 'limits';
  setActiveTab: (tab: 'focus' | 'plan' | 'rooms' | 'limits') => void;
  showStatsScreen: boolean;
  setShowStatsScreen: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showPaywallModal: boolean;
  setShowPaywallModal: (show: boolean) => void;
  paywallFeature: string;
  openPaywall: (featureName: string) => void;
  showScreenTimeDetail: boolean;
  setShowScreenTimeDetail: (show: boolean) => void;
  showStartSessionModal: boolean;
  setShowStartSessionModal: (show: boolean) => void;
  editingSchedule: Schedule | null;
  setEditingSchedule: (schedule: Schedule | null) => void;
  showCreateSchedule: boolean;
  setShowCreateSchedule: (show: boolean) => void;

  // Active Session
  activeSession: ActiveSession | null;
  startSession: (config: {
    mode: 'timer' | 'stopwatch' | 'pomodoro';
    durationMin: number;
    tagId: string;
    strict: boolean;
    blockApps: boolean;
    ambientSound: string;
    soundVolume: number;
    pomodoroConfig?: {
      focusMin: number;
      shortBreakMin: number;
      longBreakMin: number;
      cyclesBeforeLong: number;
    };
  }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endActiveSession: (completed?: boolean) => Session | null;
  skipPomodoroPhase: () => void;
  recentCompletedSession: Session | null;
  setRecentCompletedSession: (session: Session | null) => void;

  // Data & Management
  tags: Tag[];
  addTag: (tag: Tag) => void;
  sessions: Session[];
  saveSessionNote: (sessionId: string, note: string) => void;
  deleteSession: (sessionId: string) => void;
  todayFocusedMinutes: number;

  schedules: Schedule[];
  toggleSchedule: (id: string) => void;
  saveSchedule: (schedule: Schedule) => boolean;
  deleteSchedule: (id: string) => void;
  addSuggestedSchedule: (index: number) => { success: boolean; scheduleName: string; undo: () => void };

  appLimits: AppLimit[];
  saveAppLimit: (limit: AppLimit) => void;
  deleteAppLimit: (appId: string) => void;

  blockConfig: BlockConfig;
  updateBlockConfig: (updater: (prev: BlockConfig) => BlockConfig) => void;

  goals: Goals;
  updateGoals: (goals: Goals) => void;

  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  togglePlus: () => void;

  // Themes
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (a: AccentTheme) => void;

  // Tour
  tourStep: number;
  setTourStep: (step: number) => void;
  dismissTour: () => void;

  // Reset / Clear
  clearAllData: () => void;
  loadDemoSeedData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'focus' | 'plan' | 'rooms' | 'limits'>('focus');
  const [showStatsScreen, setShowStatsScreen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('Stillwater Plus');
  const [showScreenTimeDetail, setShowScreenTimeDetail] = useState(false);
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [recentCompletedSession, setRecentCompletedSession] = useState<Session | null>(null);

  // Stored state items
  const [tags, setTags] = useState<Tag[]>(() => storage.get('tags', DEFAULT_TAGS));
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = storage.get<Session[]>('sessions', []);
    return saved.length > 0 ? saved : generateSeedSessions();
  });
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = storage.get<Schedule[]>('schedules', []);
    if (saved.length > 0) return saved;
    return [
      {
        id: 'sched_morning',
        ...SUGGESTED_SCHEDULES[0],
        name: 'Morning Study'
      },
      {
        id: 'sched_afternoon',
        ...SUGGESTED_SCHEDULES[2],
        name: 'Afternoon Study'
      }
    ];
  });
  const [appLimits, setAppLimits] = useState<AppLimit[]>(() => storage.get('app_limits', DEFAULT_APP_LIMITS));
  const [blockConfig, setBlockConfig] = useState<BlockConfig>(() => storage.get('block_config', DEFAULT_BLOCK_CONFIG));
  const [goals, setGoals] = useState<Goals>(() => storage.get('goals', DEFAULT_GOALS));
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = storage.get('profile', DEFAULT_PROFILE);
    return { ...saved, isPlus: true };
  });
  const [theme, setThemeState] = useState<ThemeMode>(() => storage.get('theme', 'dark'));
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(() => storage.get('accent_theme', 'aqua'));
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => storage.get('active_session', null));
  const [tourStep, setTourStep] = useState<number>(() => {
    const savedTour = storage.get('tour_completed', false);
    return savedTour ? 0 : 1;
  });

  // Sync to local storage
  useEffect(() => { storage.set('tags', tags); }, [tags]);
  useEffect(() => { storage.set('sessions', sessions); }, [sessions]);
  useEffect(() => { storage.set('schedules', schedules); }, [schedules]);
  useEffect(() => { storage.set('app_limits', appLimits); }, [appLimits]);
  useEffect(() => { storage.set('block_config', blockConfig); }, [blockConfig]);
  useEffect(() => { storage.set('goals', goals); }, [goals]);
  useEffect(() => { storage.set('profile', profile); }, [profile]);
  useEffect(() => { storage.set('theme', theme); }, [theme]);
  useEffect(() => { storage.set('accent_theme', accentTheme); }, [accentTheme]);
  useEffect(() => { storage.set('active_session', activeSession); }, [activeSession]);

  // Apply CSS theme classes to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'accent-aqua', 'accent-violet', 'accent-sunset');

    if (theme === 'light') {
      root.classList.add('theme-light');
    }

    if (accentTheme === 'violet') {
      root.classList.add('accent-violet');
    } else if (accentTheme === 'sunset') {
      root.classList.add('accent-sunset');
    } else {
      root.classList.add('accent-aqua');
    }
  }, [theme, accentTheme]);

  // Compute today's focused minutes
  const todayFocusedMinutes = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return sessions
      .filter(s => s.completed && s.start >= startOfToday)
      .reduce((acc, s) => acc + s.durationMin, 0);
  }, [sessions]);

  // Open paywall modal
  const openPaywall = (featureName: string) => {
    setPaywallFeature(featureName);
    setShowPaywallModal(true);
    nativeBridge.triggerHaptic('light');
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    nativeBridge.triggerHaptic('light');
  };

  // Every accent theme including Sunset is completely free
  const setAccentTheme = (accent: AccentTheme) => {
    setAccentThemeState(accent);
    nativeBridge.triggerHaptic('light');
  };

  const togglePlus = () => {
    setProfile(p => ({ ...p, isPlus: true }));
    nativeBridge.triggerHaptic('success');
  };

  // Start a new session
  const startSession: AppContextType['startSession'] = ({
    mode,
    durationMin,
    tagId,
    strict,
    blockApps,
    ambientSound,
    soundVolume,
    pomodoroConfig
  }) => {
    const now = Date.now();
    const strictUntil = strict ? now + durationMin * 60 * 1000 : 0;

    const newSession: ActiveSession = {
      id: `sess_${now}`,
      mode,
      targetDurationMin: durationMin,
      startedAt: now,
      pausedDurationMs: 0,
      isPaused: false,
      tagId,
      strict,
      strictUntil,
      blockApps,
      ambientSound,
      soundVolume,
      pomodoroState: mode === 'pomodoro' ? {
        phase: 'focus',
        currentCycle: 1,
        focusMin: pomodoroConfig?.focusMin || 25,
        shortBreakMin: pomodoroConfig?.shortBreakMin || 5,
        longBreakMin: pomodoroConfig?.longBreakMin || 15,
        cyclesBeforeLong: pomodoroConfig?.cyclesBeforeLong || 4,
      } : undefined
    };

    setActiveSession(newSession);
    setShowStartSessionModal(false);

    if (ambientSound !== 'None') {
      audioService.play(ambientSound, soundVolume);
    }

    if (blockApps) {
      nativeBridge.startBlocking(blockConfig, appLimits.map(a => a.appId));
    }

    nativeBridge.triggerHaptic('medium');
  };

  const pauseSession = () => {
    if (!activeSession || activeSession.isPaused) return;
    setActiveSession({
      ...activeSession,
      isPaused: true,
      pausedAt: Date.now()
    });
    audioService.stop();
    nativeBridge.triggerHaptic('light');
  };

  const resumeSession = () => {
    if (!activeSession || !activeSession.isPaused || !activeSession.pausedAt) return;
    const additionalPause = Date.now() - activeSession.pausedAt;
    setActiveSession({
      ...activeSession,
      isPaused: false,
      pausedDurationMs: activeSession.pausedDurationMs + additionalPause,
      pausedAt: undefined
    });
    if (activeSession.ambientSound !== 'None') {
      audioService.play(activeSession.ambientSound, activeSession.soundVolume);
    }
    nativeBridge.triggerHaptic('light');
  };

  const endActiveSession = (completed = true): Session | null => {
    if (!activeSession) return null;
    const now = Date.now();
    const elapsedMs = (activeSession.isPaused && activeSession.pausedAt)
      ? activeSession.pausedAt - activeSession.startedAt - activeSession.pausedDurationMs
      : now - activeSession.startedAt - activeSession.pausedDurationMs;

    const durationMin = Math.max(1, Math.round(elapsedMs / (60 * 1000)));

    const finishedSession: Session = {
      id: activeSession.id,
      start: activeSession.startedAt,
      end: now,
      durationMin,
      mode: activeSession.mode,
      tagId: activeSession.tagId,
      strict: activeSession.strict,
      completed
    };

    // Stop sound & native blocking
    audioService.stop();
    audioService.playBell();
    nativeBridge.stopBlocking();
    nativeBridge.triggerHaptic('success');

    // Add session to history
    setSessions(prev => [finishedSession, ...prev]);
    setActiveSession(null);

    // Update profile total hours & streak
    setProfile(p => {
      const newTotalHours = Math.round((p.totalHours + durationMin / 60) * 10) / 10;
      return {
        ...p,
        totalHours: newTotalHours,
        streak: p.streak + 1,
      };
    });

    if (completed) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#5EEAD4', '#A78BFA', '#FBBF24']
        });
      } catch {
        // Safe fallback
      }
      setRecentCompletedSession(finishedSession);
    }

    return finishedSession;
  };

  const skipPomodoroPhase = () => {
    if (!activeSession || activeSession.mode !== 'pomodoro' || !activeSession.pomodoroState) return;
    const ps = activeSession.pomodoroState;
    let nextPhase: 'focus' | 'short_break' | 'long_break' = 'short_break';
    let nextCycle = ps.currentCycle;

    if (ps.phase === 'focus') {
      if (ps.currentCycle >= ps.cyclesBeforeLong) {
        nextPhase = 'long_break';
      } else {
        nextPhase = 'short_break';
      }
    } else {
      // Break ended, start next focus
      nextPhase = 'focus';
      if (ps.phase === 'long_break') {
        nextCycle = 1;
      } else {
        nextCycle = ps.currentCycle + 1;
      }
    }

    setActiveSession({
      ...activeSession,
      startedAt: Date.now(),
      pausedDurationMs: 0,
      isPaused: false,
      pomodoroState: {
        ...ps,
        phase: nextPhase,
        currentCycle: nextCycle
      }
    });

    audioService.playBell();
    nativeBridge.triggerHaptic('medium');
  };

  const saveSessionNote = (sessionId: string, note: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, note } : s));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const addTag = (tag: Tag) => {
    setTags(prev => [...prev, tag]);
  };

  // Schedules - Unlimited & 100% Free
  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    nativeBridge.triggerHaptic('light');
  };

  const saveSchedule = (schedule: Schedule): boolean => {
    setSchedules(prev => {
      const idx = prev.findIndex(s => s.id === schedule.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = schedule;
        return copy;
      }
      return [schedule, ...prev];
    });

    setShowCreateSchedule(false);
    setEditingSchedule(null);
    nativeBridge.triggerHaptic('success');
    return true;
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const addSuggestedSchedule = (index: number) => {
    const suggested = SUGGESTED_SCHEDULES[index];
    if (!suggested) return { success: false, scheduleName: '', undo: () => {} };

    const newId = `sched_sugg_${Date.now()}`;
    const newSchedule: Schedule = {
      ...suggested,
      id: newId,
      enabled: true
    };

    setSchedules(prev => [newSchedule, ...prev]);
    nativeBridge.triggerHaptic('success');

    return {
      success: true,
      scheduleName: suggested.name,
      undo: () => {
        setSchedules(prev => prev.filter(s => s.id !== newId));
      }
    };
  };

  // App limits
  const saveAppLimit = (limit: AppLimit) => {
    setAppLimits(prev => {
      const idx = prev.findIndex(a => a.appId === limit.appId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = limit;
        return copy;
      }
      return [...prev, limit];
    });
    nativeBridge.triggerHaptic('success');
  };

  const deleteAppLimit = (appId: string) => {
    setAppLimits(prev => prev.filter(a => a.appId !== appId));
  };

  const updateBlockConfig = (updater: (prev: BlockConfig) => BlockConfig) => {
    setBlockConfig(prev => updater(prev));
  };

  const updateGoals = (newGoals: Goals) => {
    setGoals(newGoals);
    nativeBridge.triggerHaptic('success');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(p => ({ ...p, ...updates }));
  };

  const dismissTour = () => {
    setTourStep(0);
    storage.set('tour_completed', true);
  };

  const clearAllData = () => {
    storage.clearAll();
    setSessions([]);
    setSchedules([]);
    setAppLimits([]);
    setProfile(DEFAULT_PROFILE);
    setActiveSession(null);
    audioService.stop();
    nativeBridge.stopBlocking();
    nativeBridge.triggerHaptic('warning');
  };

  const loadDemoSeedData = () => {
    const seedSessions = generateSeedSessions();
    setSessions(seedSessions);
    setSchedules([
      { id: 'sched_morning', ...SUGGESTED_SCHEDULES[0], name: 'Morning Study' },
      { id: 'sched_afternoon', ...SUGGESTED_SCHEDULES[2], name: 'Afternoon Study' }
    ]);
    setAppLimits(DEFAULT_APP_LIMITS);
    setBlockConfig(DEFAULT_BLOCK_CONFIG);
    setProfile(DEFAULT_PROFILE);
    nativeBridge.triggerHaptic('success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        showStatsScreen,
        setShowStatsScreen,
        showProfileModal,
        setShowProfileModal,
        showPaywallModal,
        setShowPaywallModal,
        paywallFeature,
        openPaywall,
        showScreenTimeDetail,
        setShowScreenTimeDetail,
        showStartSessionModal,
        setShowStartSessionModal,
        editingSchedule,
        setEditingSchedule,
        showCreateSchedule,
        setShowCreateSchedule,
        activeSession,
        startSession,
        pauseSession,
        resumeSession,
        endActiveSession,
        skipPomodoroPhase,
        recentCompletedSession,
        setRecentCompletedSession,
        tags,
        addTag,
        sessions,
        saveSessionNote,
        deleteSession,
        todayFocusedMinutes,
        schedules,
        toggleSchedule,
        saveSchedule,
        deleteSchedule,
        addSuggestedSchedule,
        appLimits,
        saveAppLimit,
        deleteAppLimit,
        blockConfig,
        updateBlockConfig,
        goals,
        updateGoals,
        profile,
        updateProfile,
        togglePlus,
        theme,
        setTheme,
        accentTheme,
        setAccentTheme,
        tourStep,
        setTourStep,
        dismissTour,
        clearAllData,
        loadDemoSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
