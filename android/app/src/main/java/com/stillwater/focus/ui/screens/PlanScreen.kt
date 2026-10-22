package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.model.Schedule
import com.stillwater.focus.theme.*

@Composable
fun PlanScreen(
    schedules: List<Schedule>,
    onToggleSchedule: (String) -> Unit,
    onCreateScheduleClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedDay by remember { mutableStateOf(1) } // 1 = Monday
    val dayLabelsShort = listOf("M", "T", "W", "T", "F", "S", "S")
    val dayLabelsFull = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        val screenWidth = maxWidth
        val isTablet = screenWidth >= 600.dp
        val horizontalPadding = if (isTablet) 32.dp else 20.dp
        val contentMaxWidth = if (isTablet) 860.dp else screenWidth

        val activeDaySchedules = schedules.filter { it.days.contains(selectedDay) }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 96.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Column(
                modifier = Modifier
                    .widthIn(max = contentMaxWidth)
                    .fillMaxWidth()
                    .padding(horizontal = horizontalPadding)
                    .padding(top = 24.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CalendarToday,
                                contentDescription = null,
                                tint = PrimaryAqua,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "ROUTINE PLANNER",
                                color = PrimaryAqua,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                        }
                        Text(
                            text = "Study Schedules",
                            color = TextPrimary,
                            fontSize = if (isTablet) 28.sp else 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Automate your deep focus routines",
                            color = TextSecondary,
                            fontSize = 13.sp
                        )
                    }

                    FilledTonalButton(
                        onClick = onCreateScheduleClick,
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = AquaGlow.copy(alpha = 0.15f),
                            contentColor = AquaGlow
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "New Schedule",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Add Routine", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                // Automatic App Lock Feature Card
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(AquaGlow.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = "Auto Guard",
                                tint = AquaGlow,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Automatic App Lock",
                                color = TextPrimary,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp
                            )
                            Text(
                                text = "Scheduled blocks automatically shield you from social media and video traps.",
                                color = TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                // Day Selector Strip
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "SELECT DAY",
                            color = TextTertiary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            for (i in 1..7) {
                                val isSelected = selectedDay == i
                                val hasRoutine = schedules.any { it.days.contains(i) && it.enabled }
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(if (isTablet) 52.dp else 44.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isSelected) PrimaryAqua else Color.Transparent)
                                        .clickable { selectedDay = i },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center
                                    ) {
                                        Text(
                                            text = if (isTablet) dayLabelsFull[i - 1] else dayLabelsShort[i - 1],
                                            color = if (isSelected) PrimaryInk else TextLight,
                                            fontSize = if (isTablet) 12.sp else 11.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                        )
                                        if (hasRoutine) {
                                            Box(
                                                modifier = Modifier
                                                    .padding(top = 2.dp)
                                                    .size(4.dp)
                                                    .clip(CircleShape)
                                                    .background(if (isSelected) PrimaryInk else PrimaryAqua)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Section Title with Count
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ROUTINES FOR ${dayLabelsFull[selectedDay - 1].uppercase()}",
                        color = TextTertiary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "${activeDaySchedules.size} Active",
                        color = PrimaryAqua,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // Schedules Display: 2-Column Grid on Tablet, Vertical Stack on Mobile
                if (activeDaySchedules.isEmpty()) {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark.copy(alpha = 0.5f)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = null,
                                tint = TextMuted.copy(alpha = 0.5f),
                                modifier = Modifier.size(36.dp)
                            )
                            Text(
                                text = "No routines scheduled for ${dayLabelsFull[selectedDay - 1]}",
                                color = TextMuted,
                                fontSize = 13.sp
                            )
                            Button(
                                onClick = onCreateScheduleClick,
                                shape = CircleShape,
                                colors = ButtonDefaults.buttonColors(containerColor = SurfaceVariantDark),
                                modifier = Modifier.padding(top = 8.dp)
                            ) {
                                Text("Add a Routine", color = TextLight, fontSize = 12.sp)
                            }
                        }
                    }
                } else if (isTablet) {
                    // 2-Column Tablet Grid
                    activeDaySchedules.chunked(2).forEach { rowSchedules ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            rowSchedules.forEach { schedule ->
                                ScheduleItemCard(
                                    schedule = schedule,
                                    dayLabels = dayLabelsShort,
                                    onToggle = { onToggleSchedule(schedule.id) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            if (rowSchedules.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                } else {
                    // Mobile Vertical Stack
                    activeDaySchedules.forEach { schedule ->
                        ScheduleItemCard(
                            schedule = schedule,
                            dayLabels = dayLabelsShort,
                            onToggle = { onToggleSchedule(schedule.id) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ScheduleItemCard(
    schedule: Schedule,
    dayLabels: List<String>,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = schedule.name,
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 2.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = null,
                            tint = AquaGlow,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${schedule.from} – ${schedule.to}",
                            color = AquaGlow,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Switch(
                    checked = schedule.enabled,
                    onCheckedChange = { onToggle() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = DarkBackground,
                        checkedTrackColor = AquaGlow,
                        uncheckedThumbColor = TextTertiary,
                        uncheckedTrackColor = BorderDark
                    )
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Days row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                for (i in 1..7) {
                    val active = schedule.days.contains(i)
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(if (active) AquaGlow else SurfaceVariantDark),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = dayLabels[i - 1],
                            color = if (active) DarkBackground else TextSecondary,
                            fontSize = 10.sp,
                            fontWeight = if (active) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }

            if (schedule.blockedAppIds.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = TextTertiary,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = "${schedule.blockedAppIds.size} apps blocked during routine",
                        color = TextTertiary,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
