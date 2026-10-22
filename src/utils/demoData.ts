import { AppLimit, BlockConfig, Goals, Schedule, Session, Tag, UserProfile } from '../types';

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag_study', name: 'Study', color: '#5EEAD4' },
  { id: 'tag_coding', name: 'Coding', color: '#38BDF8' },
  { id: 'tag_reading', name: 'Reading', color: '#FBBF24' },
  { id: 'tag_revision', name: 'Revision', color: '#A78BFA' },
  { id: 'tag_math', name: 'Math / Logic', color: '#F43F5E' },
  { id: 'tag_project', name: 'Projects', color: '#34D399' }
];

export const SUGGESTED_SCHEDULES: Omit<Schedule, 'id'>[] = [
  {
    name: 'Early Bird',
    from: '05:30',
    to: '07:30',
    days: [1, 2, 3, 4, 5],
    reminder: { enabled: true, leadMin: 10, quote: 'The calmest hours hold the deepest insights.' },
    breaks: { lengthMin: 5, count: 2 },
    blockedAppIds: ['app_bytegram', 'app_cliptube', 'app_tokscroll', 'app_snapline'],
    ultraFocus: false,
    enabled: true
  },
  {
    name: 'Deep Block',
    from: '10:00',
    to: '12:00',
    days: [1, 2, 3, 4, 5, 6],
    reminder: { enabled: true, leadMin: 5, quote: 'Focus is a muscle. Train it in stillness.' },
    breaks: { lengthMin: 10, count: 1 },
    blockedAppIds: ['app_bytegram', 'app_cliptube', 'app_tokscroll'],
    ultraFocus: true,
    enabled: true
  },
  {
    name: 'Afternoon Study',
    from: '14:00',
    to: '16:00',
    days: [1, 2, 3, 4, 5],
    reminder: { enabled: true, leadMin: 5, quote: 'Beat the afternoon slump with clear intentions.' },
    breaks: { lengthMin: 5, count: 3 },
    blockedAppIds: ['app_bytegram', 'app_cliptube', 'app_playdeck'],
    ultraFocus: false,
    enabled: false
  },
  {
    name: 'Night Review',
    from: '20:00',
    to: '22:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminder: { enabled: true, leadMin: 10, quote: 'Consolidate memory before sleep.' },
    breaks: { lengthMin: 5, count: 2 },
    blockedAppIds: ['app_bytegram', 'app_tokscroll', 'app_streamflow'],
    ultraFocus: false,
    enabled: false
  }
];

export const DEFAULT_GOALS: Goals = {
  dailyMin: 360, // 6 hours
  weeklyMin: 1800 // 30 hours (or 5 * 6h)
};

export const DEFAULT_BLOCK_CONFIG: BlockConfig = {
  shorts: {
    video: true,
    reels: true,
    spotlight: true
  },
  websites: ['reddit.com', 'x.com', 'twitch.tv', 'facebook.com', 'tiktok.com'],
  categories: ['Social Media', 'Short Video', 'Video Games'],
  studyBrowserAllowList: ['wikipedia.org', 'coursera.org', 'github.com', 'stackoverflow.com', 'khanacademy.org', 'arxiv.org'],
  studyVideoChannels: ['3Blue1Brown', 'Khan Academy', 'MIT OpenCourseWare', 'CS50', 'Veritasium'],
  protections: {
    uninstall: false,
    splitScreen: true,
    floating: true,
    notifications: true
  }
};

export const DEFAULT_APP_LIMITS: AppLimit[] = [
  { appId: 'app_bytegram', dailyMin: 45, days: [0, 1, 2, 3, 4, 5, 6], strict: true },
  { appId: 'app_cliptube', dailyMin: 60, days: [1, 2, 3, 4, 5], strict: false },
  { appId: 'app_snapline', dailyMin: 30, days: [0, 1, 2, 3, 4, 5, 6], strict: false },
  { appId: 'app_tokscroll', dailyMin: 25, days: [1, 2, 3, 4, 5], strict: true }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Kai Rivera',
  avatarInitial: 'K',
  avatarColor: '#5EEAD4',
  streak: 7,
  longestStreak: 14,
  totalHours: 84.5,
  isPlus: true,
  onboarded: true,
  showTour: true,
  emergencyExitAllowed: true,
  badges: [
    { id: 'b_first_hour', title: 'First Hour', description: 'Completed your first 60 minutes of uninterrupted stillness.', unlocked: true, icon: 'Droplets' },
    { id: 'b_streak_7', title: '7-Day Streak', description: 'Reaching deep flow 7 days in a row.', unlocked: true, icon: 'Flame' },
    { id: 'b_night_owl', title: 'Night Owl', description: 'Studied past 10 PM without touching blocked apps.', unlocked: true, icon: 'Moon' },
    { id: 'b_early_bird', title: 'Early Bird', description: 'Completed a 6 AM morning block.', unlocked: true, icon: 'Sun' },
    { id: 'b_century', title: '100 Hours Club', description: 'Accumulated 100 hours of locked focus.', unlocked: false, icon: 'Trophy' },
  ]
};

// Generates 30 days of realistic sessions for statistical charts
export function generateSeedSessions(): Session[] {
  const sessions: Session[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  // Generate sessions for past 28 days
  const tagIds = ['tag_study', 'tag_coding', 'tag_reading', 'tag_revision', 'tag_math'];
  const modes: ('timer' | 'pomodoro' | 'stopwatch')[] = ['pomodoro', 'timer', 'pomodoro', 'timer'];

  for (let d = 27; d >= 0; d--) {
    const dayTimestamp = now - d * dayMs;
    const date = new Date(dayTimestamp);
    const dayOfWeek = date.getDay();

    // Weekend slightly fewer sessions
    const sessionCount = (dayOfWeek === 0 || dayOfWeek === 6) ? 2 : Math.floor(Math.random() * 2) + 3;

    let hourCursor = 9; // start around 9 am
    for (let s = 0; s < sessionCount; s++) {
      const durationMin = [25, 45, 50, 60, 90][Math.floor(Math.random() * 5)];
      const startTime = new Date(date).setHours(hourCursor, Math.floor(Math.random() * 20), 0, 0);
      const endTime = startTime + durationMin * 60 * 1000;

      sessions.push({
        id: `sess_${d}_${s}`,
        start: startTime,
        end: endTime,
        durationMin,
        mode: modes[Math.floor(Math.random() * modes.length)],
        tagId: tagIds[Math.floor(Math.random() * tagIds.length)],
        strict: Math.random() > 0.4,
        note: durationMin > 50 ? 'Chapter review and exercise set' : undefined,
        completed: true
      });

      hourCursor += Math.floor(durationMin / 60) + 1 + Math.floor(Math.random() * 2);
    }
  }

  return sessions;
}
