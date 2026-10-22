package com.stillwater.focus.data

import com.stillwater.focus.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class StillwaterRepository {
    private val _tags = MutableStateFlow(
        listOf(
            Tag("tag_study", "Study", "#5EEAD4"),
            Tag("tag_coding", "Coding", "#38BDF8"),
            Tag("tag_reading", "Reading", "#FBBF24"),
            Tag("tag_revision", "Revision", "#A78BFA"),
            Tag("tag_math", "Math / Logic", "#F43F5E"),
            Tag("tag_project", "Projects", "#34D399")
        )
    )
    val tags: StateFlow<List<Tag>> = _tags.asStateFlow()

    private val _sessions = MutableStateFlow<List<Session>>(emptyList())
    val sessions: StateFlow<List<Session>> = _sessions.asStateFlow()

    private val _schedules = MutableStateFlow(
        listOf(
            Schedule(
                id = "sched_morning",
                name = "Morning Study",
                from = "06:00",
                to = "08:00",
                days = listOf(1, 2, 3, 4, 5),
                blockedAppIds = listOf("app_bytegram", "app_cliptube"),
                enabled = true
            ),
            Schedule(
                id = "sched_afternoon",
                name = "Afternoon Study",
                from = "14:00",
                to = "16:00",
                days = listOf(1, 2, 3, 4, 5),
                blockedAppIds = listOf("app_bytegram", "app_tokscroll"),
                enabled = false
            )
        )
    )
    val schedules: StateFlow<List<Schedule>> = _schedules.asStateFlow()

    private val _appLimits = MutableStateFlow(
        listOf(
            AppLimit("app_bytegram", "ByteGram", 45, strict = true),
            AppLimit("app_cliptube", "ClipTube", 60, strict = false),
            AppLimit("app_snapline", "Snapline", 30, strict = false),
            AppLimit("app_tokscroll", "TokScroll", 25, strict = true)
        )
    )
    val appLimits: StateFlow<List<AppLimit>> = _appLimits.asStateFlow()

    private val _blockConfig = MutableStateFlow(BlockConfig())
    val blockConfig: StateFlow<BlockConfig> = _blockConfig.asStateFlow()

    private val _profile = MutableStateFlow(UserProfile())
    val profile: StateFlow<UserProfile> = _profile.asStateFlow()

    private val _activeSession = MutableStateFlow<ActiveSession?>(null)
    val activeSession: StateFlow<ActiveSession?> = _activeSession.asStateFlow()

    private val _rooms = MutableStateFlow(
        listOf(
            Room(
                id = "room_mcat",
                name = "Pre-Med & MCAT Grind",
                subject = "Biology / Chem",
                code = "MCAT26",
                members = listOf(
                    Member("u_elena", "Elena V.", "focusing", 142, 12, "#5EEAD4", "Revision"),
                    Member("u_marcus", "Marcus Chen", "focusing", 110, 8, "#A78BFA", "Study"),
                    Member("u_sarah", "Sarah K.", "break", 75, 5, "#FBBF24", "Break")
                )
            ),
            Room(
                id = "room_cs",
                name = "Algorithms & LeetCode",
                subject = "Computer Science",
                code = "CODE99",
                members = listOf(
                    Member("u_zack", "Zack R.", "focusing", 130, 15, "#60A5FA", "Coding"),
                    Member("u_priya", "Priya M.", "focusing", 90, 9, "#EC4899", "Coding")
                )
            )
        )
    )
    val rooms: StateFlow<List<Room>> = _rooms.asStateFlow()

    init {
        // Seed historical sessions
        val now = System.currentTimeMillis()
        val dayMs = 86400000L
        val sampleSessions = mutableListOf<Session>()
        for (i in 0..6) {
            val startT = now - (i * dayMs) + (9 * 3600000L)
            sampleSessions.add(
                Session(
                    id = "seed_$i",
                    start = startT,
                    end = startT + (50 * 60000L),
                    durationMin = 50,
                    mode = SessionMode.TIMER,
                    tagId = "tag_study",
                    strict = false,
                    note = "Chapter review",
                    completed = true
                )
            )
        }
        _sessions.value = sampleSessions
    }

    fun startSession(mode: SessionMode, durationMin: Int, tagId: String, strict: Boolean, ambientSound: String) {
        val now = System.currentTimeMillis()
        val strictUntil = if (strict) now + (durationMin * 60000L) else 0L
        _activeSession.value = ActiveSession(
            id = "sess_${now}",
            mode = mode,
            targetDurationMin = durationMin,
            startedAt = now,
            tagId = tagId,
            strict = strict,
            strictUntil = strictUntil,
            ambientSound = ambientSound
        )
    }

    fun pauseSession() {
        _activeSession.update { it?.copy(isPaused = true) }
    }

    fun resumeSession() {
        _activeSession.update { it?.copy(isPaused = false) }
    }

    fun endSession(): Session? {
        val current = _activeSession.value ?: return null
        val now = System.currentTimeMillis()
        val durationMin = maxOf(1, ((now - current.startedAt) / 60000L).toInt())
        val completedSession = Session(
            id = current.id,
            start = current.startedAt,
            end = now,
            durationMin = durationMin,
            mode = current.mode,
            tagId = current.tagId,
            strict = current.strict,
            completed = true
        )
        _sessions.update { listOf(completedSession) + it }
        _activeSession.value = null
        _profile.update {
            it.copy(
                totalHours = it.totalHours + (durationMin / 60f),
                streak = it.streak + 1
            )
        }
        return completedSession
    }

    fun toggleSchedule(id: String) {
        _schedules.update { list ->
            list.map { if (it.id == id) it.copy(enabled = !it.enabled) else it }
        }
    }

    fun saveSchedule(schedule: Schedule) {
        _schedules.update { list ->
            val idx = list.indexOfFirst { it.id == schedule.id }
            if (idx >= 0) {
                list.toMutableList().apply { set(idx, schedule) }
            } else {
                listOf(schedule) + list
            }
        }
    }

    fun updateBlockConfig(transform: (BlockConfig) -> BlockConfig) {
        _blockConfig.update(transform)
    }

    fun updateGoals(dailyMin: Int, weeklyMin: Int) {
        _profile.update { it.copy(dailyGoalMin = dailyMin, weeklyGoalMin = weeklyMin) }
    }

    fun updateProfile(transform: (UserProfile) -> UserProfile) {
        _profile.update(transform)
    }
}
