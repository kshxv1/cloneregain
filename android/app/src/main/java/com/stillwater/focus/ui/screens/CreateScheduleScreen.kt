package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
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
fun CreateScheduleScreen(
    onDismiss: () -> Unit,
    onSaveSchedule: (Schedule) -> Unit,
    modifier: Modifier = Modifier
) {
    var name by remember { mutableStateOf("Evening Study") }
    var fromTime by remember { mutableStateOf("19:00") }
    var toTime by remember { mutableStateOf("21:00") }
    var selectedDays by remember { mutableStateOf(setOf(1, 2, 3, 4, 5)) }
    var ultraFocus by remember { mutableStateOf(false) }

    val dayNames = listOf("M", "T", "W", "T", "F", "S", "S")

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 600.dp)
                .fillMaxSize()
                .padding(bottom = 24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                // Top bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "New Focus Schedule",
                        color = TextPrimary,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = TextSecondary
                        )
                    }
                }

                // Name field
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Routine Name") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = AquaGlow,
                        unfocusedBorderColor = BorderDark,
                        focusedLabelColor = AquaGlow,
                        unfocusedLabelColor = TextSecondary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                // Time Pickers
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    OutlinedTextField(
                        value = fromTime,
                        onValueChange = { fromTime = it },
                        label = { Text("Starts At") },
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = AquaGlow,
                            unfocusedBorderColor = BorderDark,
                            focusedLabelColor = AquaGlow,
                            unfocusedLabelColor = TextSecondary
                        )
                    )
                    OutlinedTextField(
                        value = toTime,
                        onValueChange = { toTime = it },
                        label = { Text("Ends At") },
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = AquaGlow,
                            unfocusedBorderColor = BorderDark,
                            focusedLabelColor = AquaGlow,
                            unfocusedLabelColor = TextSecondary
                        )
                    )
                }

                // Days Selection
                Column {
                    Text(
                        text = "REPEAT DAYS",
                        color = TextTertiary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        modifier = Modifier.padding(bottom = 10.dp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        for (i in 1..7) {
                            val isSelected = selectedDays.contains(i)
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) AquaGlow else SurfaceDark)
                                    .clickable {
                                        selectedDays = if (isSelected) {
                                            selectedDays - i
                                        } else {
                                            selectedDays + i
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = dayNames[i - 1],
                                    color = if (isSelected) DarkBackground else TextSecondary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // Strict Lock Toggle
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Strict Shield",
                                color = TextPrimary,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Prevents early cancellation during scheduled times",
                                color = TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                        Switch(
                            checked = ultraFocus,
                            onCheckedChange = { ultraFocus = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = DarkBackground,
                                checkedTrackColor = StrictRed,
                                uncheckedThumbColor = TextTertiary,
                                uncheckedTrackColor = BorderDark
                            )
                        )
                    }
                }
            }

            // Save Button
            Button(
                onClick = {
                    val newSchedule = Schedule(
                        id = "sched_${System.currentTimeMillis()}",
                        name = name.ifEmpty { "Focus Routine" },
                        from = fromTime,
                        to = toTime,
                        days = selectedDays.toList(),
                        ultraFocus = ultraFocus,
                        enabled = true
                    )
                    onSaveSchedule(newSchedule)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(26.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AquaGlow,
                    contentColor = DarkBackground
                )
            ) {
                Text(
                    text = "Save Schedule",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
