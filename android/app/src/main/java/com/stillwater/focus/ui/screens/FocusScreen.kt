package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.model.Schedule
import com.stillwater.focus.model.UserProfile
import com.stillwater.focus.theme.*
import com.stillwater.focus.ui.components.CircularProgressRing
import com.stillwater.focus.ui.components.ScreenTimeCard

@Composable
fun FocusScreen(
    todayFocusedMin: Int,
    profile: UserProfile,
    onStartTimerClick: () -> Unit,
    onStatsClick: () -> Unit,
    onProfileClick: () -> Unit,
    onGoalClick: () -> Unit,
    onAddSuggestedSchedule: (Schedule) -> Unit,
    modifier: Modifier = Modifier
) {
    val progress = if (profile.dailyGoalMin > 0) todayFocusedMin.toFloat() / profile.dailyGoalMin.toFloat() else 0f
    val displayHours = todayFocusedMin / 60
    val displayMins = todayFocusedMin % 60
    val displayTime = if (displayHours > 0) "${displayHours}h ${displayMins}m" else "${displayMins}m"

    val goalHours = profile.dailyGoalMin / 60
    val goalRemainderMins = profile.dailyGoalMin % 60
    val goalText = if (goalRemainderMins > 0) "Goal ${goalHours}h ${goalRemainderMins}m" else "Goal ${goalHours}h"
    val isGoalReached = todayFocusedMin >= profile.dailyGoalMin && profile.dailyGoalMin > 0

    val suggestedSchedules = listOf(
        Schedule("sugg_early", "Early Bird", "05:30", "07:30", listOf(1, 2, 3, 4, 5)),
        Schedule("sugg_deep", "Deep Block", "10:00", "12:00", listOf(1, 2, 3, 4, 5, 6)),
        Schedule("sugg_afternoon", "Afternoon Study", "14:00", "16:00", listOf(1, 2, 3, 4, 5)),
        Schedule("sugg_night", "Night Review", "20:00", "22:00", listOf(0, 1, 2, 3, 4, 5, 6))
    )

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(BgDark)
    ) {
        val screenWidth = maxWidth
        val screenHeight = maxHeight
        val isTablet = screenWidth >= 600.dp
        val isCompactHeight = screenHeight < 680.dp

        // Dynamic responsive sizing for circular ring based on device screen metrics
        val ringSize = when {
            isCompactHeight -> 190.dp
            screenWidth < 350.dp -> 210.dp
            isTablet -> 260.dp
            screenHeight > 820.dp -> 265.dp
            else -> 235.dp
        }

        val strokeWidth = when {
            ringSize < 210.dp -> 16.dp
            ringSize < 250.dp -> 20.dp
            else -> 22.dp
        }

        val timeFontSize = when {
            ringSize < 210.dp -> 30.sp
            ringSize < 250.dp -> 36.sp
            else -> 42.sp
        }

        val horizontalPadding = when {
            isTablet -> 32.dp
            screenWidth < 360.dp -> 14.dp
            else -> 20.dp
        }

        val contentMaxWidth = if (isTablet) 860.dp else screenWidth

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = if (isTablet) 32.dp else 96.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Column(
                modifier = Modifier
                    .widthIn(max = contentMaxWidth)
                    .fillMaxWidth()
                    .padding(horizontal = horizontalPadding)
                    .padding(top = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(if (isCompactHeight) 12.dp else 20.dp)
            ) {
                // Top Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // User Avatar button
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(PrimaryAqua)
                            .clickable { onProfileClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = profile.avatarInitial,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryInk,
                            fontSize = 16.sp
                        )
                    }

                    // Status pill indicator
                    Surface(
                        color = SurfaceDark.copy(alpha = 0.8f),
                        shape = CircleShape,
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(PrimaryAqua)
                            )
                            Text(
                                text = "Stillwater Focus",
                                fontSize = 12.sp,
                                color = TextMuted,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    // Stats button
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(SurfaceDark)
                            .border(1.dp, BorderDark, CircleShape)
                            .clickable { onStatsClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.BarChart,
                            contentDescription = "Stats",
                            tint = TextLight,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                if (isTablet) {
                    // ============================================
                    // TABLET OPTIMIZED 2-COLUMN RESPONSIVE LAYOUT
                    // ============================================
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(32.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        // Left Column: Hero Ring, Goal Pill, and Docked CTA
                        Column(
                            modifier = Modifier.weight(0.9f),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            CircularProgressRing(
                                progress = progress,
                                displayTime = displayTime,
                                goalText = goalText,
                                onArrowClick = onStatsClick,
                                onGoalClick = onGoalClick,
                                ringSize = ringSize,
                                strokeWidthDp = strokeWidth,
                                timeFontSize = timeFontSize
                            )

                            // Explicit "Set Custom Goal" button
                            Surface(
                                color = SurfaceVariantDark.copy(alpha = 0.6f),
                                shape = CircleShape,
                                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .clickable { onGoalClick() }
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Tune,
                                        contentDescription = null,
                                        tint = PrimaryAqua,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Text(
                                        text = "Set Custom Goal",
                                        fontSize = 13.sp,
                                        color = TextMuted,
                                        fontWeight = FontWeight.Medium
                                    )
                                    if (isGoalReached) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = "Goal reached",
                                            tint = SuccessGreen,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }
                            }

                            // Tablet Docked Start Focus Timer Action
                            Button(
                                onClick = onStartTimerClick,
                                shape = CircleShape,
                                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(58.dp)
                                    .padding(top = 8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Start focus timer",
                                            color = Color.Black,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp
                                        )
                                        Text(
                                            text = "Timer • Stopwatch • Pomodoro",
                                            color = Color.Gray,
                                            fontSize = 11.sp
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .size(38.dp)
                                            .clip(CircleShape)
                                            .background(SuccessGreen),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.PlayArrow,
                                            contentDescription = "Start",
                                            tint = Color.Black,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // Right Column: Screen Time Breakdown Card + Suggested Routines
                        Column(
                            modifier = Modifier.weight(1.1f),
                            verticalArrangement = Arrangement.spacedBy(18.dp)
                        ) {
                            ScreenTimeCard(
                                totalMin = todayFocusedMin + 35,
                                productiveMin = todayFocusedMin + 20,
                                onClick = onStatsClick
                            )

                            // Suggested Routines Grid
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text(
                                    text = "Suggested schedule",
                                    fontSize = 13.sp,
                                    color = TextMuted,
                                    fontWeight = FontWeight.Medium
                                )

                                suggestedSchedules.chunked(2).forEach { rowItems ->
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        rowItems.forEach { item ->
                                            Card(
                                                shape = RoundedCornerShape(20.dp),
                                                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Row(
                                                    modifier = Modifier
                                                        .padding(14.dp)
                                                        .fillMaxWidth(),
                                                    horizontalArrangement = Arrangement.SpaceBetween,
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Column(modifier = Modifier.weight(1f)) {
                                                        Text(
                                                            text = item.name,
                                                            fontSize = 14.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = TextLight,
                                                            maxLines = 1
                                                        )
                                                        Text(
                                                            text = "${item.from} - ${item.to}",
                                                            fontSize = 12.sp,
                                                            color = TextMuted
                                                        )
                                                    }
                                                    IconButton(
                                                        onClick = { onAddSuggestedSchedule(item) },
                                                        modifier = Modifier
                                                            .size(34.dp)
                                                            .clip(CircleShape)
                                                            .background(SurfaceVariantDark)
                                                    ) {
                                                        Icon(
                                                            imageVector = Icons.Default.Add,
                                                            contentDescription = "Add",
                                                            tint = TextLight,
                                                            modifier = Modifier.size(16.dp)
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                        if (rowItems.size == 1) {
                                            Spacer(modifier = Modifier.weight(1f))
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // ============================================
                    // MOBILE-FIRST SINGLE COLUMN LAYOUT
                    // ============================================
                    // Center Circular Progress Ring
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(vertical = if (isCompactHeight) 4.dp else 8.dp)
                    ) {
                        CircularProgressRing(
                            progress = progress,
                            displayTime = displayTime,
                            goalText = goalText,
                            onArrowClick = onStatsClick,
                            onGoalClick = onGoalClick,
                            ringSize = ringSize,
                            strokeWidthDp = strokeWidth,
                            timeFontSize = timeFontSize
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Explicit "Set Custom Goal" button
                        Surface(
                            color = SurfaceVariantDark.copy(alpha = 0.6f),
                            shape = CircleShape,
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                            modifier = Modifier
                                .clip(CircleShape)
                                .clickable { onGoalClick() }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Tune,
                                    contentDescription = null,
                                    tint = PrimaryAqua,
                                    modifier = Modifier.size(13.dp)
                                )
                                Text(
                                    text = "Set Custom Goal",
                                    fontSize = 12.sp,
                                    color = TextMuted,
                                    fontWeight = FontWeight.Medium
                                )
                                if (isGoalReached) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Goal reached",
                                        tint = SuccessGreen,
                                        modifier = Modifier.size(13.dp)
                                    )
                                }
                            }
                        }
                    }

                    // Lower Section: Screen Time Card + Suggested Schedules
                    ScreenTimeCard(
                        totalMin = todayFocusedMin + 35,
                        productiveMin = todayFocusedMin + 20,
                        onClick = onStatsClick
                    )

                    // Suggested Schedules Carousel
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Suggested schedule",
                            fontSize = 13.sp,
                            color = TextMuted,
                            fontWeight = FontWeight.Medium
                        )

                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(suggestedSchedules) { item ->
                                Card(
                                    shape = RoundedCornerShape(22.dp),
                                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                                    modifier = Modifier.width(if (screenWidth < 360.dp) 240.dp else 275.dp)
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .padding(14.dp)
                                            .fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(
                                                text = item.name,
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = TextLight
                                            )
                                            Text(
                                                text = "${item.from} - ${item.to}",
                                                fontSize = 12.sp,
                                                color = TextMuted
                                            )
                                        }
                                        IconButton(
                                            onClick = { onAddSuggestedSchedule(item) },
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(SurfaceVariantDark)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Add,
                                                contentDescription = "Add",
                                                tint = TextLight,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Primary Start Timer Action Pill Button for Mobile
                    Button(
                        onClick = onStartTimerClick,
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .padding(top = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Start focus timer",
                                    color = Color.Black,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Text(
                                    text = "Timer • Stopwatch • Pomodoro",
                                    color = Color.Gray,
                                    fontSize = 11.sp
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(SuccessGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PlayArrow,
                                    contentDescription = "Start",
                                    tint = Color.Black,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
