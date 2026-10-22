import { BlockConfig, InstalledApp, UsageStat } from '../types';

export type PermissionType = 'usage' | 'overlay' | 'accessibility' | 'notification' | 'deviceAdmin';

export interface NativeBridge {
  getInstalledApps(): Promise<InstalledApp[]>;
  getUsageStats(range: 'day' | 'week' | 'month'): Promise<UsageStat[]>;
  startBlocking(config: BlockConfig, appIds: string[]): Promise<boolean>;
  stopBlocking(): Promise<boolean>;
  isBlockingActive(): boolean;
  hasPermission(type: PermissionType): Promise<boolean>;
  requestPermission(type: PermissionType): Promise<boolean>;
  isUninstallProtected(): Promise<boolean>;
  setUninstallProtection(enabled: boolean): Promise<boolean>;
  triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' | 'error'): void;
  scheduleAlarmReminder(id: string, timestamp: number, title: string, body: string): Promise<boolean>;
  cancelAlarmReminder(id: string): Promise<boolean>;
}

// Fictional apps with original names and generic categorizations to avoid third-party trademark infringement
export const MOCK_INSTALLED_APPS: InstalledApp[] = [
  { id: 'app_bytegram', name: 'ByteGram', category: 'social', icon: 'Camera', iconBg: 'from-pink-500 to-rose-600', isDistraction: true, dailyUsageMin: 94, pickups: 38 },
  { id: 'app_cliptube', name: 'ClipTube', category: 'video', icon: 'PlaySquare', iconBg: 'from-red-500 to-red-700', isDistraction: true, dailyUsageMin: 86, pickups: 24 },
  { id: 'app_snapline', name: 'Snapline', category: 'social', icon: 'Ghost', iconBg: 'from-amber-400 to-yellow-500', isDistraction: true, dailyUsageMin: 52, pickups: 31 },
  { id: 'app_chatly', name: 'Chatly Messenger', category: 'social', icon: 'MessageCircle', iconBg: 'from-emerald-500 to-teal-600', isDistraction: true, dailyUsageMin: 45, pickups: 42 },
  { id: 'app_threadr', name: 'Threadr', category: 'social', icon: 'Hash', iconBg: 'from-sky-500 to-blue-600', isDistraction: true, dailyUsageMin: 32, pickups: 18 },
  { id: 'app_pintile', name: 'PinTile', category: 'social', icon: 'Pin', iconBg: 'from-rose-600 to-red-600', isDistraction: true, dailyUsageMin: 22, pickups: 9 },
  { id: 'app_playdeck', name: 'PlayDeck Games', category: 'gaming', icon: 'Gamepad2', iconBg: 'from-purple-500 to-indigo-600', isDistraction: true, dailyUsageMin: 40, pickups: 7 },
  { id: 'app_streamflow', name: 'StreamFlow TV', category: 'video', icon: 'Film', iconBg: 'from-red-600 to-neutral-900', isDistraction: true, dailyUsageMin: 35, pickups: 5 },
  { id: 'app_tokscroll', name: 'TokScroll', category: 'video', icon: 'Sparkles', iconBg: 'from-cyan-400 to-pink-500', isDistraction: true, dailyUsageMin: 78, pickups: 46 },
  { id: 'app_newsflow', name: 'NewsFlow Reader', category: 'reading', icon: 'Newspaper', iconBg: 'from-blue-500 to-slate-700', isDistraction: false, dailyUsageMin: 14, pickups: 6 },
  { id: 'app_podpulse', name: 'PodPulse', category: 'reading', icon: 'Headphones', iconBg: 'from-green-500 to-emerald-700', isDistraction: false, dailyUsageMin: 25, pickups: 4 },
  { id: 'app_codex_notes', name: 'Codex Notes', category: 'work', icon: 'FileText', iconBg: 'from-amber-500 to-orange-600', isDistraction: false, dailyUsageMin: 48, pickups: 12 },
  { id: 'app_flashcards', name: 'Zen Cards Study', category: 'work', icon: 'BookOpen', iconBg: 'from-teal-400 to-emerald-600', isDistraction: false, dailyUsageMin: 55, pickups: 8 },
  { id: 'app_calc_sci', name: 'OmniCalc Pro', category: 'utility', icon: 'Calculator', iconBg: 'from-slate-600 to-zinc-800', isDistraction: false, dailyUsageMin: 12, pickups: 15 },
  { id: 'app_maps', name: 'Wayfinder Maps', category: 'utility', icon: 'Compass', iconBg: 'from-blue-400 to-indigo-500', isDistraction: false, dailyUsageMin: 8, pickups: 3 },
  { id: 'app_mailsync', name: 'MailSync', category: 'work', icon: 'Mail', iconBg: 'from-red-400 to-rose-500', isDistraction: false, dailyUsageMin: 18, pickups: 19 },
  { id: 'app_audiobook', name: 'AudioVault', category: 'reading', icon: 'Bookmark', iconBg: 'from-orange-500 to-amber-600', isDistraction: false, dailyUsageMin: 30, pickups: 4 },
  { id: 'app_chessforge', name: 'ChessForge', category: 'gaming', icon: 'Trophy', iconBg: 'from-stone-700 to-stone-900', isDistraction: true, dailyUsageMin: 28, pickups: 5 },
  { id: 'app_shoptrove', name: 'ShopTrove', category: 'utility', icon: 'ShoppingBag', iconBg: 'from-amber-500 to-yellow-600', isDistraction: true, dailyUsageMin: 19, pickups: 11 },
  { id: 'app_cloudvault', name: 'CloudVault Drive', category: 'work', icon: 'HardDrive', iconBg: 'from-blue-600 to-cyan-600', isDistraction: false, dailyUsageMin: 10, pickups: 4 }
];

export class MockNativeBridge implements NativeBridge {
  private blockingActive = false;
  private uninstallProtected = false;
  private permissions: Record<PermissionType, boolean> = {
    usage: true,
    overlay: true,
    accessibility: true,
    notification: true,
    deviceAdmin: false,
  };

  /**
   * TODO(native): implement with Android PackageManager queryIntentActivities()
   * and getApplicationInfo() to enumerate launchable apps with real icon drawables.
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    return [...MOCK_INSTALLED_APPS];
  }

  /**
   * TODO(native): implement with Android UsageStatsManager.queryUsageStats()
   * or queryEvents() for precise foreground usage buckets (IntervalType: DAILY, WEEKLY, MONTHLY).
   */
  async getUsageStats(range: 'day' | 'week' | 'month'): Promise<UsageStat[]> {
    const multiplier = range === 'day' ? 1 : range === 'week' ? 6.2 : 26.5;
    return MOCK_INSTALLED_APPS.map(app => ({
      appId: app.id,
      usageMin: Math.round(app.dailyUsageMin * multiplier),
      category: app.category,
    }));
  }

  /**
   * TODO(native): implement using Android AccessibilityService onAccessibilityEvent()
   * to detect package changes, and WindowManager.addView() with TYPE_APPLICATION_OVERLAY
   * to display the calm blocking lock screen over restricted applications.
   */
  async startBlocking(config: BlockConfig, appIds: string[]): Promise<boolean> {
    this.blockingActive = true;
    console.info('[MockNativeBridge] Started blocking with config:', { config, appIds });
    return true;
  }

  /**
   * TODO(native): implement removing overlay window and disabling enforcement hooks.
   */
  async stopBlocking(): Promise<boolean> {
    this.blockingActive = false;
    console.info('[MockNativeBridge] Stopped blocking');
    return true;
  }

  isBlockingActive(): boolean {
    return this.blockingActive;
  }

  /**
   * TODO(native): Check permissions via:
   * - Usage: AppOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, ...)
   * - Overlay: Settings.canDrawOverlays(context)
   * - Accessibility: AccessibilityManager.getEnabledAccessibilityServiceList()
   * - Notification: NotificationManagerCompat.from(context).areNotificationsEnabled()
   * - DeviceAdmin: DevicePolicyManager.isAdminActive(componentName)
   */
  async hasPermission(type: PermissionType): Promise<boolean> {
    return this.permissions[type] ?? false;
  }

  /**
   * TODO(native): Launch corresponding Android Settings Intents:
   * - Settings.ACTION_USAGE_ACCESS_SETTINGS
   * - Settings.ACTION_MANAGE_OVERLAY_PERMISSION
   * - Settings.ACTION_ACCESSIBILITY_SETTINGS
   * - DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN
   */
  async requestPermission(type: PermissionType): Promise<boolean> {
    this.permissions[type] = true;
    return true;
  }

  /**
   * TODO(native): implement with DevicePolicyManager.isAdminActive()
   */
  async isUninstallProtected(): Promise<boolean> {
    return this.uninstallProtected;
  }

  /**
   * TODO(native): Bind DeviceAdminReceiver to prevent package uninstallation without password
   */
  async setUninstallProtection(enabled: boolean): Promise<boolean> {
    this.uninstallProtected = enabled;
    return true;
  }

  /**
   * TODO(native): implement with Android Vibrator or VibratorManager.vibrate(VibrationEffect)
   */
  triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' | 'error'): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(25);
            break;
          case 'success':
            navigator.vibrate([15, 40, 20]);
            break;
          case 'warning':
            navigator.vibrate([30, 60, 30]);
            break;
          case 'error':
            navigator.vibrate([40, 80, 40, 80, 40]);
            break;
        }
      } catch {
        // Safe fallback if blocked in iframe
      }
    }
  }

  /**
   * TODO(native): implement with Android AlarmManager.setExactAndAllowWhileIdle()
   * or WorkManager for scheduled session reminders and notifications.
   */
  async scheduleAlarmReminder(id: string, timestamp: number, title: string, body: string): Promise<boolean> {
    console.info(`[MockNativeBridge] Scheduled alarm ${id} at ${new Date(timestamp).toLocaleTimeString()}: ${title} - ${body}`);
    return true;
  }

  /**
   * TODO(native): AlarmManager.cancel(pendingIntent)
   */
  async cancelAlarmReminder(id: string): Promise<boolean> {
    console.info(`[MockNativeBridge] Cancelled alarm ${id}`);
    return true;
  }
}

export const nativeBridge = new MockNativeBridge();
