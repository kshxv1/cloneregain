export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type SessionMode = 'timer' | 'stopwatch' | 'pomodoro';

export type Session = {
  id: string;
  start: number; // Unix timestamp ms
  end: number;   // Unix timestamp ms
  durationMin: number; // computed or recorded duration in minutes
  mode: SessionMode;
  tagId: string;
  strict: boolean;
  note?: string;
  completed: boolean;
};

export type Schedule = {
  id: string;
  name: string;
  from: string; // e.g. "06:00" or "14:00"
  to: string;   // e.g. "08:00" or "16:00"
  days: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  reminder: {
    enabled: boolean;
    leadMin: number; // 0, 5, 10
    quote?: string;
  };
  breaks: {
    lengthMin: number;
    count: number;
  };
  blockedAppIds: string[];
  ultraFocus: boolean; // Plus feature
  enabled: boolean;
};

export type AppLimit = {
  appId: string;
  dailyMin: number;
  days: number[];
  strict: boolean;
  strictUntil?: number; // timestamp until when it cannot be modified
};

export type BlockConfig = {
  shorts: {
    video: boolean;      // Short-form video in video apps
    reels: boolean;      // Reels in social photo apps
    spotlight: boolean;  // Spotlight in chat apps
  };
  websites: string[];
  categories: string[]; // e.g., 'Adult', 'Social', 'News', 'Gaming'
  studyBrowserAllowList: string[];
  studyVideoChannels: string[];
  protections: {
    uninstall: boolean;
    splitScreen: boolean;
    floating: boolean;
    notifications: boolean;
  };
};

export type Goals = {
  dailyMin: number;
  weeklyMin: number;
};

export type MemberStatus = 'focusing' | 'break' | 'idle';

export type Member = {
  id: string;
  name: string;
  status: MemberStatus;
  todayMin: number;
  streak: number;
  avatarColor: string;
  currentTag?: string;
  joinedAt?: number;
};

export type Room = {
  id: string;
  name: string;
  subject: string;
  isPublic: boolean;
  members: Member[];
  code: string;
  goalMin?: number;
};

export type InstalledApp = {
  id: string;
  name: string;
  category: 'social' | 'video' | 'gaming' | 'reading' | 'utility' | 'work';
  icon: string; // Lucide icon name or emoji representation
  iconBg: string;
  isDistraction: boolean;
  dailyUsageMin: number; // sample mock usage
  pickups: number;
};

export type UsageStat = {
  appId: string;
  usageMin: number;
  category: string;
};

export type ThemeMode = 'system' | 'dark' | 'light';
export type AccentTheme = 'aqua' | 'violet' | 'sunset';

export type UserProfile = {
  name: string;
  avatarInitial: string;
  avatarColor: string;
  streak: number;
  longestStreak: number;
  totalHours: number;
  isPlus: boolean;
  onboarded: boolean;
  showTour: boolean;
  emergencyExitAllowed: boolean;
  badges: {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    icon: string;
  }[];
};

export type ActiveSession = {
  id: string;
  mode: SessionMode;
  targetDurationMin: number; // for timer
  startedAt: number;
  pausedDurationMs: number;
  isPaused: boolean;
  pausedAt?: number;
  tagId: string;
  strict: boolean;
  strictUntil: number;
  blockApps: boolean;
  ambientSound: string;
  soundVolume: number;
  // Pomodoro details
  pomodoroState?: {
    phase: 'focus' | 'short_break' | 'long_break';
    currentCycle: number;
    focusMin: number;
    shortBreakMin: number;
    longBreakMin: number;
    cyclesBeforeLong: number;
  };
};
