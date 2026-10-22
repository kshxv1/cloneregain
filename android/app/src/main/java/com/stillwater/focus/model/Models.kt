package com.stillwater.focus.model

enum class SessionMode {
    TIMER, STOPWATCH, POMODORO
}

data class Tag(
    val id: String,
    val name: String,
    val colorHex: String
)

data class Session(
    val id: String,
    val start: Long,
    val end: Long,
    val durationMin: Int,
    val mode: SessionMode,
    val tagId: String,
    val strict: Boolean,
    val note: String? = null,
    val completed: Boolean = true
)

data class Schedule(
    val id: String,
    val name: String,
    val from: String,
    val to: String,
    val days: List<Int>,
    val reminderEnabled: Boolean = true,
    val reminderLeadMin: Int = 5,
    val breakLengthMin: Int = 5,
    val breakCount: Int = 3,
    val blockedAppIds: List<String> = emptyList(),
    val ultraFocus: Boolean = false,
    val enabled: Boolean = true
)

data class AppLimit(
    val appId: String,
    val appName: String,
    val dailyMin: Int,
    val strict: Boolean = false
)

data class BlockConfig(
    val blockShorts: Boolean = true,
    val blockReels: Boolean = true,
    val blockSpotlight: Boolean = true,
    val blockedWebsites: List<String> = listOf("reddit.com", "x.com", "tiktok.com", "facebook.com"),
    val uninstallProtected: Boolean = false,
    val splitScreenBlocked: Boolean = true,
    val floatingWindowBlocked: Boolean = true,
    val notificationsBlocked: Boolean = true
)

data class Member(
    val id: String,
    val name: String,
    val status: String, // "focusing", "break", "idle"
    val todayMin: Int,
    val streak: Int,
    val colorHex: String,
    val currentTag: String = "Study"
)

data class Room(
    val id: String,
    val name: String,
    val subject: String,
    val code: String,
    val members: List<Member>
)

data class UserProfile(
    val name: String = "Kai Rivera",
    val avatarInitial: String = "K",
    val streak: Int = 7,
    val longestStreak: Int = 14,
    val totalHours: Float = 84.5f,
    val dailyGoalMin: Int = 360,
    val weeklyGoalMin: Int = 1800,
    val emergencyExitAllowed: Boolean = true,
    val selectedAccent: String = "aqua"
)

data class ActiveSession(
    val id: String,
    val mode: SessionMode,
    val targetDurationMin: Int,
    val startedAt: Long,
    val tagId: String,
    val strict: Boolean,
    val strictUntil: Long,
    val ambientSound: String,
    val isPaused: Boolean = false,
    val pomodoroPhase: String = "focus", // "focus", "short_break", "long_break"
    val pomodoroCycle: Int = 1
)
