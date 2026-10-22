# Stillwater — Digital Wellbeing & Focus App

> **Original Product Constitution**: Designed from the ground up for students looking to break algorithmic doom-scrolling, achieve uninterrupted deep work, and build consistent daily study habits.

---

## 1. Native Android Architecture & API Mapping

The web application exposes a typed `NativeBridge` interface (`src/services/NativeBridge.ts`). When wrapping via Capacitor or compiling to native Android (Kotlin / Jetpack Compose), wire each method to the corresponding Android framework subsystem:

| Bridge Method | Native Android API / Framework | Android Permission / Intent |
|---|---|---|
| `getInstalledApps()` | `PackageManager.queryIntentActivities()` + `getApplicationInfo()` | `<queries>` block in `AndroidManifest.xml` |
| `getUsageStats(range)` | `UsageStatsManager.queryUsageStats()` or `queryEvents()` | `android.permission.PACKAGE_USAGE_STATS` (prompt via `Settings.ACTION_USAGE_ACCESS_SETTINGS`) |
| `startBlocking(config, appIds)` | `AccessibilityService.onAccessibilityEvent()` (detects foreground package & view hierarchies) + `WindowManager.addView()` with `TYPE_APPLICATION_OVERLAY` | `android.permission.SYSTEM_ALERT_WINDOW` (`Settings.ACTION_MANAGE_OVERLAY_PERMISSION`) |
| `stopBlocking()` | `WindowManager.removeView()` on active overlay + disabling blocking flag | None |
| `hasPermission(type)` | `AppOpsManager.checkOpNoThrow(OPSTR_GET_USAGE_STATS)` & `Settings.canDrawOverlays()` & `AccessibilityManager.getEnabledAccessibilityServiceList()` | System query |
| `requestPermission(type)` | Launching `Intent(Settings.ACTION_*)` | Context `startActivity()` |
| `isUninstallProtected()` | `DevicePolicyManager.isAdminActive(componentName)` | Device Admin Receiver |
| `setUninstallProtection(bool)` | `DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN` | `android.permission.BIND_DEVICE_ADMIN` |
| `scheduleAlarmReminder()` | `AlarmManager.setExactAndAllowWhileIdle()` or `WorkManager.enqueue()` | `android.permission.SCHEDULE_EXACT_ALARM` |
| `triggerHaptic(type)` | `VibratorManager.vibrate(VibrationEffect.createPredefined(...))` | `android.permission.VIBRATE` |
| **In-App Purchases (Plus)** | **Google Play Billing Library (`BillingClient.launchBillingFlow`)** | `com.android.vending.BILLING` |

---

## 2. Step-by-Step Plan to Port to Kotlin / Jetpack Compose

### Phase 1: Gradle & AndroidManifest Setup
1. Create a modern Jetpack Compose project targeting `minSdk = 26`, `targetSdk = 35`.
2. Declare required permissions in `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />
   <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   <uses-permission android:name="android.permission.VIBRATE" />
   <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
   ```

### Phase 2: Room Database & DataStore
1. Port TypeScript types (`Session`, `Schedule`, `AppLimit`, `BlockConfig`) to Kotlin `@Entity` data classes in Room.
2. Replace `localStorage` with `RoomDatabase` (`SessionDao`, `ScheduleDao`, `AppLimitDao`).
3. Store user settings and theme preferences in Android `DataStore<Preferences>`.

### Phase 3: AccessibilityService Implementation
1. Create `class FocusAccessibilityService : AccessibilityService()`.
2. Configure `accessibility_service_config.xml`:
   ```xml
   <accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
       android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
       android:accessibilityFeedbackType="feedbackGeneric"
       android:accessibilityFlags="flagDefault|flagReportViewIds|flagRetrieveInteractiveWindows"
       android:canRetrieveWindowContent="true" />
   ```
3. In `onAccessibilityEvent(event: AccessibilityEvent)`:
   - Check if `event.packageName` is inside the active blocked apps set.
   - For **Shorts / Reels blocking**: inspect child `AccessibilityNodeInfo` view IDs (e.g. reel player layouts) and trigger an immediate home intent or soft overlay while keeping the rest of the app functional.

### Phase 4: Overlay Lock Screen (`SYSTEM_ALERT_WINDOW`)
1. Create a `ComposeView` wrapped in a foreground `Service`.
2. Attach using `WindowManager.LayoutParams(TYPE_APPLICATION_OVERLAY)`.
3. Render the calm water ripple lock screen displaying remaining locked study time and motivational quotes.

### Phase 5: Jetpack Compose UI Migration
1. Map theme tokens to `MaterialTheme` (`DarkColorScheme` with `#0B0E14` background and `#5EEAD4` primary).
2. Port UI screens:
   - `FocusScreen`: `Canvas` with `drawArc()` for the concentric ripple progress ring.
   - `PlanScreen`: LazyRow for suggested schedules + LazyColumn for schedules.
   - `RoomsScreen`: Firebase Firestore snapshot listener / WebSockets for live study pod tickers.
   - `ActiveSessionScreen`: WakeLock (`PowerManager.PARTIAL_WAKE_LOCK`) + countdown Coroutine flow.

---

## 3. Features Implemented in Web Preview

- **Focus Engine**: Timer (5-240 min), Stopwatch, and Pomodoro (cycles + auto breaks).
- **Session Continuity**: Timers derive elapsed duration strictly from Unix timestamps (`Date.now() - startedAt`), surviving browser reloads and background tabs.
- **Strict Mode Enforcement**: Prevents accidental session termination with countdown timer; emergency exit requires holding down for 5 continuous seconds.
- **Synthesized Ambient Noise**: Zero-file Web Audio synthesizer generating realistic Brown Noise, Rain, Ocean Waves, and Lo-fi chord drones.
- **Schedule Management**: Create, edit, toggle study schedules with active days, alarms, and break lengths. Enforces 2-schedule limit on Free tier with Plus upgrade.
- **Digital Wellbeing Analytics**: 24-hour day timeline, tag donuts, weekly target comparisons, monthly heatmap grid, and per-app screen time usage ranking.
- **Synchronous Multiplayer Pods**: Simulated live friends with real-time status transitions (focusing/break), floating emoji cheers, and competitive leaderboards.
- **Design Tokens**: Custom calm dark theme, light theme, Aqua/Violet/Sunset palettes, and original water-ripple SVG branding.
