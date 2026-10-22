package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.stillwater.focus.model.UserProfile
import com.stillwater.focus.theme.*

@Composable
fun ProfileSettingsDialog(
    profile: UserProfile,
    onDismiss: () -> Unit,
    onSave: (UserProfile) -> Unit
) {
    var name by remember { mutableStateOf(profile.name) }
    var dailyGoalHours by remember { mutableStateOf((profile.dailyGoalMin / 60).toString()) }
    var weeklyGoalHours by remember { mutableStateOf((profile.weeklyGoalMin / 60).toString()) }
    var emergencyAllowed by remember { mutableStateOf(profile.emergencyExitAllowed) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = SurfaceDark,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Profile & Target Goals",
                        color = TextPrimary,
                        fontSize = 18.sp,
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

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Display Name") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = AquaGlow,
                        unfocusedBorderColor = BorderDark
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = dailyGoalHours,
                        onValueChange = { dailyGoalHours = it },
                        label = { Text("Daily (Hours)") },
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = AquaGlow,
                            unfocusedBorderColor = BorderDark
                        )
                    )
                    OutlinedTextField(
                        value = weeklyGoalHours,
                        onValueChange = { weeklyGoalHours = it },
                        label = { Text("Weekly (Hours)") },
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = AquaGlow,
                            unfocusedBorderColor = BorderDark
                        )
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "5-Second Emergency Exit",
                            color = TextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Allow holding unlock button 5s to cancel strict lock",
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }
                    Switch(
                        checked = emergencyAllowed,
                        onCheckedChange = { emergencyAllowed = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = DarkBackground,
                            checkedTrackColor = AquaGlow,
                            uncheckedThumbColor = TextTertiary,
                            uncheckedTrackColor = BorderDark
                        )
                    )
                }

                Button(
                    onClick = {
                        val dHours = dailyGoalHours.toIntOrNull() ?: (profile.dailyGoalMin / 60)
                        val wHours = weeklyGoalHours.toIntOrNull() ?: (profile.weeklyGoalMin / 60)
                        onSave(
                            profile.copy(
                                name = name.ifEmpty { profile.name },
                                dailyGoalMin = dHours * 60,
                                weeklyGoalMin = wHours * 60,
                                emergencyExitAllowed = emergencyAllowed
                            )
                        )
                        onDismiss()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AquaGlow,
                        contentColor = DarkBackground
                    )
                ) {
                    Text("Save Changes", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
