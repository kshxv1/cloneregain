package com.stillwater.focus.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.data.StillwaterRepository
import com.stillwater.focus.model.Schedule
import com.stillwater.focus.theme.*
import com.stillwater.focus.ui.components.CustomGoalDialog
import com.stillwater.focus.ui.screens.*

enum class NavTab(val label: String, val icon: ImageVector) {
    FOCUS("Focus", Icons.Default.FilterVintage),
    PLAN("Plan", Icons.Default.CalendarToday),
    LIMITS("Limits", Icons.Default.Shield),
    STATS("Stats", Icons.Default.BarChart),
    ROOMS("Rooms", Icons.Default.Group)
}

@Composable
fun StillwaterApp(
    repository: StillwaterRepository = remember { StillwaterRepository() }
) {
    var currentTab by remember { mutableStateOf(NavTab.FOCUS) }
    var showStartSessionSheet by remember { mutableStateOf(false) }
    var showCreateScheduleScreen by remember { mutableStateOf(false) }
    var showProfileDialog by remember { mutableStateOf(false) }
    var showCustomGoalDialog by remember { mutableStateOf(false) }

    val tags by repository.tags.collectAsState()
    val schedules by repository.schedules.collectAsState()
    val appLimits by repository.appLimits.collectAsState()
    val blockConfig by repository.blockConfig.collectAsState()
    val profile by repository.profile.collectAsState()
    val activeSession by repository.activeSession.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val sessions by repository.sessions.collectAsState()

    val todayFocusedMin = sessions.filter {
        // Today sessions
        it.start > System.currentTimeMillis() - 86400000L
    }.sumOf { it.durationMin }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Active Session Fullscreen Overlay
        if (activeSession != null) {
            val session = activeSession!!
            val tag = tags.find { it.id == session.tagId }
            ActiveSessionScreen(
                session = session,
                tag = tag,
                emergencyAllowed = profile.emergencyExitAllowed,
                onPauseToggle = {
                    if (session.isPaused) repository.resumeSession() else repository.pauseSession()
                },
                onEndSession = {
                    repository.endSession()
                }
            )
        } else {
            // Main App Content based on Current Tab
            Box(modifier = Modifier.fillMaxSize()) {
                when (currentTab) {
                    NavTab.FOCUS -> FocusScreen(
                        todayFocusedMin = todayFocusedMin,
                        profile = profile,
                        onStartTimerClick = { showStartSessionSheet = true },
                        onStatsClick = { currentTab = NavTab.STATS },
                        onProfileClick = { showProfileDialog = true },
                        onGoalClick = { showCustomGoalDialog = true },
                        onAddSuggestedSchedule = { sched ->
                            repository.saveSchedule(sched)
                        }
                    )
                    NavTab.PLAN -> PlanScreen(
                        schedules = schedules,
                        onToggleSchedule = { id -> repository.toggleSchedule(id) },
                        onCreateScheduleClick = { showCreateScheduleScreen = true }
                    )
                    NavTab.LIMITS -> LimitsScreen(
                        blockConfig = blockConfig,
                        appLimits = appLimits,
                        onUpdateBlockConfig = { transform ->
                            repository.updateBlockConfig(transform)
                        }
                    )
                    NavTab.STATS -> StatsScreen(
                        profile = profile,
                        sessions = sessions
                    )
                    NavTab.ROOMS -> RoomsScreen(
                        rooms = rooms
                    )
                }

                // Floating Bottom Navigation Pill
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 20.dp, start = 20.dp, end = 20.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(28.dp),
                        color = SurfaceDark.copy(alpha = 0.95f),
                        tonalElevation = 8.dp,
                        shadowElevation = 16.dp,
                        modifier = Modifier
                            .widthIn(max = 420.dp)
                            .fillMaxWidth()
                            .height(64.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 8.dp),
                            horizontalArrangement = Arrangement.SpaceAround,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            NavTab.values().forEach { tab ->
                                val isSelected = currentTab == tab
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(16.dp))
                                        .clickable { currentTab = tab }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(
                                        imageVector = tab.icon,
                                        contentDescription = tab.label,
                                        tint = if (isSelected) AquaGlow else TextTertiary,
                                        modifier = Modifier.size(22.dp)
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = tab.label,
                                        color = if (isSelected) AquaGlow else TextTertiary,
                                        fontSize = 10.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Start Session Sheet Modal
            if (showStartSessionSheet) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.BottomCenter
                ) {
                    StartSessionSheet(
                        tags = tags,
                        onDismiss = { showStartSessionSheet = false },
                        onStartSession = { mode, duration, tagId, strict, sound ->
                            showStartSessionSheet = false
                            repository.startSession(mode, duration, tagId, strict, sound)
                        }
                    )
                }
            }

            // Create Schedule Screen Modal
            if (showCreateScheduleScreen) {
                CreateScheduleScreen(
                    onDismiss = { showCreateScheduleScreen = false },
                    onSaveSchedule = { newSchedule ->
                        repository.saveSchedule(newSchedule)
                        showCreateScheduleScreen = false
                    }
                )
            }

            // Profile Dialog Modal
            if (showProfileDialog) {
                ProfileSettingsDialog(
                    profile = profile,
                    onDismiss = { showProfileDialog = false },
                    onSave = { updatedProfile ->
                        repository.updateProfile { updatedProfile }
                    }
                )
            }

            // Custom Focus Goal Dialog Modal
            if (showCustomGoalDialog) {
                CustomGoalDialog(
                    initialDailyMin = profile.dailyGoalMin,
                    initialWeeklyMin = profile.weeklyGoalMin,
                    todayFocusedMin = todayFocusedMin,
                    onDismiss = { showCustomGoalDialog = false },
                    onSaveGoal = { dailyMin, weeklyMin ->
                        repository.updateGoals(dailyMin, weeklyMin)
                    }
                )
            }
        }
    }
}
