package com.stillwater.focus.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.TrackChanges
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
import androidx.compose.ui.window.Dialog
import com.stillwater.focus.theme.*

data class GoalPreset(val label: String, val minutes: Int, val description: String)

@Composable
fun CustomGoalDialog(
    initialDailyMin: Int,
    initialWeeklyMin: Int,
    todayFocusedMin: Int,
    onDismiss: () -> Unit,
    onSaveGoal: (dailyMin: Int, weeklyMin: Int) -> Unit
) {
    var hours by remember { mutableStateOf(initialDailyMin / 60) }
    var minutes by remember { mutableStateOf(initialDailyMin % 60) }
    var weeklyDays by remember { mutableStateOf(5) }
    var isCustomWeekly by remember { mutableStateOf(initialWeeklyMin != initialDailyMin * 5) }
    var customWeeklyMin by remember { mutableStateOf(initialWeeklyMin) }
    var activeTab by remember { mutableStateOf(0) } // 0 = Custom, 1 = Presets

    val totalDailyMin = maxOf(15, hours * 60 + minutes)
    val calculatedWeeklyMin = if (isCustomWeekly) customWeeklyMin else totalDailyMin * weeklyDays

    val presets = listOf(
        GoalPreset("30m", 30, "Light habit"),
        GoalPreset("1h", 60, "Daily foundation"),
        GoalPreset("2h", 120, "Solid focus"),
        GoalPreset("3h", 180, "Deep study"),
        GoalPreset("4h", 240, "High productivity"),
        GoalPreset("6h", 360, "Intense sprint"),
        GoalPreset("8h", 480, "Full work block")
    )

    fun formatMin(min: Int): String {
        val h = min / 60
        val m = min % 60
        return when {
            h == 0 -> "${m}m"
            m == 0 -> "${h}h"
            else -> "${h}h ${m}m"
        }
    }

    val progressRatio = (todayFocusedMin.toFloat() / totalDailyMin.toFloat()).coerceIn(0f, 1f)
    val progressPercent = (progressRatio * 100).toInt()
    val remainingMin = maxOf(0, totalDailyMin - todayFocusedMin)

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = SurfaceDark,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(22.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(PrimaryAqua.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.TrackChanges,
                                contentDescription = null,
                                tint = PrimaryAqua,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Custom Focus Goal",
                                color = TextLight,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Set daily target and weekly rhythm",
                                color = TextMuted,
                                fontSize = 11.sp
                            )
                        }
                    }
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.05f))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = TextMuted,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                // Tab Switch: Custom Time vs Presets
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgDark)
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (activeTab == 0) SurfaceVariantDark else Color.Transparent)
                            .clickable { activeTab = 0 }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Custom Time",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (activeTab == 0) TextLight else TextMuted
                        )
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (activeTab == 1) SurfaceVariantDark else Color.Transparent)
                            .clickable { activeTab = 1 }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Quick Presets",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (activeTab == 1) TextLight else TextMuted
                        )
                    }
                }

                if (activeTab == 0) {
                    // Custom Hours & Minutes Stepper Cards
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark.copy(alpha = 0.6f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Text(
                                text = "DAILY DURATION",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextMuted,
                                letterSpacing = 1.sp
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Hours Box
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text(
                                            text = "Hours",
                                            fontSize = 11.sp,
                                            color = TextMuted
                                        )
                                        Row(
                                            modifier = Modifier.padding(vertical = 6.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            IconButton(
                                                onClick = { if (hours > 0) hours-- },
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .clip(CircleShape)
                                                    .background(Color.White.copy(alpha = 0.08f))
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Remove,
                                                    contentDescription = "Minus",
                                                    tint = TextLight,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                            Text(
                                                text = "$hours",
                                                fontSize = 24.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = TextLight,
                                                modifier = Modifier.widthIn(min = 32.dp),
                                                textAlign = TextAlign.Center
                                            )
                                            IconButton(
                                                onClick = { if (hours < 16) hours++ },
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .clip(CircleShape)
                                                    .background(Color.White.copy(alpha = 0.08f))
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Add,
                                                    contentDescription = "Add",
                                                    tint = TextLight,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                        }
                                        Text(
                                            text = "0 - 16 hrs",
                                            fontSize = 9.sp,
                                            color = TextMuted
                                        )
                                    }
                                }

                                // Minutes Box
                                Card(
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text(
                                            text = "Minutes",
                                            fontSize = 11.sp,
                                            color = TextMuted
                                        )
                                        Row(
                                            modifier = Modifier.padding(vertical = 6.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            IconButton(
                                                onClick = {
                                                    if (minutes >= 15) {
                                                        minutes -= 15
                                                    } else if (hours > 0) {
                                                        hours--
                                                        minutes = 45
                                                    }
                                                },
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .clip(CircleShape)
                                                    .background(Color.White.copy(alpha = 0.08f))
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Remove,
                                                    contentDescription = "Minus",
                                                    tint = TextLight,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                            Text(
                                                text = String.format("%02d", minutes),
                                                fontSize = 24.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = TextLight,
                                                modifier = Modifier.widthIn(min = 36.dp),
                                                textAlign = TextAlign.Center
                                            )
                                            IconButton(
                                                onClick = {
                                                    if (minutes + 15 < 60) {
                                                        minutes += 15
                                                    } else if (hours < 16) {
                                                        hours++
                                                        minutes = 0
                                                    }
                                                },
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .clip(CircleShape)
                                                    .background(Color.White.copy(alpha = 0.08f))
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Add,
                                                    contentDescription = "Add",
                                                    tint = TextLight,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                        }
                                        Text(
                                            text = "±15m step",
                                            fontSize = 9.sp,
                                            color = TextMuted
                                        )
                                    }
                                }
                            }

                            // Slider
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Slider adjust", fontSize = 11.sp, color = TextMuted)
                                    Text(
                                        formatMin(totalDailyMin),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryAqua
                                    )
                                }
                                Slider(
                                    value = totalDailyMin.toFloat(),
                                    onValueChange = {
                                        val total = it.toInt()
                                        hours = total / 60
                                        minutes = total % 60
                                    },
                                    valueRange = 15f..720f,
                                    steps = 46,
                                    colors = SliderDefaults.colors(
                                        thumbColor = PrimaryAqua,
                                        activeTrackColor = PrimaryAqua,
                                        inactiveTrackColor = BgDark
                                    )
                                )
                            }
                        }
                    }
                } else {
                    // Presets Grid
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        presets.chunked(2).forEach { row ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                row.forEach { preset ->
                                    val isSelected = totalDailyMin == preset.minutes
                                    Card(
                                        shape = RoundedCornerShape(16.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) PrimaryAqua.copy(alpha = 0.15f) else SurfaceVariantDark.copy(alpha = 0.6f)
                                        ),
                                        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, PrimaryAqua) else null,
                                        modifier = Modifier
                                            .weight(1f)
                                            .clickable {
                                                hours = preset.minutes / 60
                                                minutes = preset.minutes % 60
                                            }
                                    ) {
                                        Column(modifier = Modifier.padding(12.dp)) {
                                            Text(
                                                text = preset.label,
                                                fontSize = 16.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isSelected) PrimaryAqua else TextLight
                                            )
                                            Text(
                                                text = preset.description,
                                                fontSize = 11.sp,
                                                color = TextMuted
                                            )
                                        }
                                    }
                                }
                                if (row.size == 1) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }

                // Forecast & Progress Preview
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Today's forecast",
                                fontSize = 12.sp,
                                color = TextMuted,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "${formatMin(todayFocusedMin)} / ${formatMin(totalDailyMin)} ($progressPercent%)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextLight
                            )
                        }

                        LinearProgressIndicator(
                            progress = { progressRatio },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = PrimaryAqua,
                            trackColor = BgDark
                        )

                        Text(
                            text = if (remainingMin == 0) "🎉 Daily target reached today!" else "${formatMin(remainingMin)} needed to complete today",
                            fontSize = 11.sp,
                            color = if (remainingMin == 0) SuccessGreen else TextMuted
                        )
                    }
                }

                // Weekly Rhythm
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark.copy(alpha = 0.6f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Weekly Target",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextLight
                                )
                                Text(
                                    text = if (isCustomWeekly) "Custom total" else "$weeklyDays days × daily goal",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                            }
                            Text(
                                text = "${formatMin(calculatedWeeklyMin)} / wk",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryAqua
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(5 to "5 Days", 6 to "6 Days", 7 to "7 Days").forEach { (days, label) ->
                                val selected = !isCustomWeekly && weeklyDays == days
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (selected) PrimaryAqua.copy(alpha = 0.2f) else SurfaceDark)
                                        .border(
                                            width = 1.dp,
                                            color = if (selected) PrimaryAqua else BorderDark,
                                            shape = RoundedCornerShape(10.dp)
                                        )
                                        .clickable {
                                            isCustomWeekly = false
                                            weeklyDays = days
                                        }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (selected) PrimaryAqua else TextMuted
                                    )
                                }
                            }
                        }
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onDismiss,
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.08f)),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Text("Cancel", color = TextMuted, fontSize = 14.sp)
                    }

                    Button(
                        onClick = {
                            onSaveGoal(totalDailyMin, calculatedWeeklyMin)
                            onDismiss()
                        },
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryAqua),
                        modifier = Modifier
                            .weight(1.4f)
                            .height(48.dp)
                    ) {
                        Text(
                            "Save Goal",
                            color = PrimaryInk,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}
