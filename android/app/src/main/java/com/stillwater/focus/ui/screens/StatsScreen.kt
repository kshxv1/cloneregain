package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.model.Session
import com.stillwater.focus.model.UserProfile
import com.stillwater.focus.theme.*

@Composable
fun StatsScreen(
    profile: UserProfile,
    sessions: List<Session>,
    modifier: Modifier = Modifier
) {
    var selectedRange by remember { mutableStateOf("Week") }

    val daysOfWeek = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    val weekFocusHours = listOf(4.2f, 5.5f, 6.0f, 3.8f, 5.2f, 7.0f, 4.5f)
    val maxWeekHours = 8.0f

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 20.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // Title
        item {
            Column {
                Text(
                    text = "Insights & Analytics",
                    color = TextPrimary,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Track your cognitive clarity and flow consistency",
                    color = TextSecondary,
                    fontSize = 13.sp
                )
            }
        }

        // Summary KPI Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Streak Card
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocalFireDepartment,
                                contentDescription = null,
                                tint = StreakAmber,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "STREAK",
                                color = TextTertiary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "${profile.streak} Days",
                            color = TextPrimary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Best: ${profile.longestStreak} days",
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }
                }

                // Total Hours Card
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Timer,
                                contentDescription = null,
                                tint = AquaGlow,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "LIFETIME",
                                color = TextTertiary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "${profile.totalHours}h",
                            color = TextPrimary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Total deep focus",
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        // Period Filter Tabs
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(SurfaceDark)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf("Day", "Week", "Month").forEach { tab ->
                    val isSelected = selectedRange == tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) AquaGlow else Color.Transparent)
                            .clickable { selectedRange = tab }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = tab,
                            color = if (isSelected) DarkBackground else TextSecondary,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Main Chart Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = if (selectedRange == "Week") "Weekly Focus Distribution" else if (selectedRange == "Day") "Today's 24-Hour Rhythm" else "30-Day Heatmap",
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Goal: ${profile.dailyGoalMin / 60}h daily",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    if (selectedRange == "Month") {
                        // 30-day calendar heatmap
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            for (row in 0..4) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    for (col in 0..6) {
                                        val dayIdx = (row * 7) + col
                                        val intensity = if (dayIdx < 28) ((dayIdx * 37) % 5) / 4f else 0.2f
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .aspectRatio(1f)
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(AquaGlow.copy(alpha = (intensity * 0.85f).coerceAtLeast(0.1f)))
                                        )
                                    }
                                }
                            }
                        }
                    } else {
                        // Weekly bar chart
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            weekFocusHours.forEachIndexed { index, hours ->
                                val heightRatio = (hours / maxWeekHours).coerceIn(0.1f, 1f)
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        text = "${hours}h",
                                        color = TextSecondary,
                                        fontSize = 10.sp,
                                        modifier = Modifier.padding(bottom = 6.dp)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .width(20.dp)
                                            .fillMaxHeight(heightRatio)
                                            .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                                            .background(if (index == 5) AquaGlow else AquaGlow.copy(alpha = 0.5f))
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = daysOfWeek[index],
                                        color = TextTertiary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Tag breakdown
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Subject Breakdown",
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    SubjectBarRow(name = "Study & Revision", percent = 0.45f, color = AquaGlow)
                    Spacer(modifier = Modifier.height(10.dp))
                    SubjectBarRow(name = "Coding & Algorithms", percent = 0.30f, color = BlueAccent)
                    Spacer(modifier = Modifier.height(10.dp))
                    SubjectBarRow(name = "Reading & Papers", percent = 0.15f, color = StreakAmber)
                    Spacer(modifier = Modifier.height(10.dp))
                    SubjectBarRow(name = "Math / Logic", percent = 0.10f, color = StrictRed)
                }
            }
        }
    }
}

@Composable
private fun SubjectBarRow(name: String, percent: Float, color: Color) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = name, color = TextPrimary, fontSize = 13.sp)
            Text(text = "${(percent * 100).toInt()}%", color = TextSecondary, fontSize = 13.sp)
        }
        Spacer(modifier = Modifier.height(6.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(BorderDark)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(percent)
                    .background(color)
            )
        }
    }
}
