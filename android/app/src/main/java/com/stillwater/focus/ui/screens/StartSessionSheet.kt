package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.model.SessionMode
import com.stillwater.focus.model.Tag
import com.stillwater.focus.theme.*

@Composable
fun StartSessionSheet(
    tags: List<Tag>,
    onDismiss: () -> Unit,
    onStartSession: (mode: SessionMode, durationMin: Int, tagId: String, strict: Boolean, sound: String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedMode by remember { mutableStateOf(SessionMode.TIMER) }
    var selectedDuration by remember { mutableIntStateOf(45) }
    var selectedTagId by remember { mutableStateOf(tags.firstOrNull()?.id ?: "tag_study") }
    var strictMode by remember { mutableStateOf(false) }
    var selectedSound by remember { mutableStateOf("Stream Waters") }

    val durationPresets = listOf(15, 25, 45, 60, 90)
    val soundscapes = listOf("Stream Waters", "Rain on Leaves", "Deep White Noise", "Silent Stillness")

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
            .background(SurfaceDark)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Begin Focus Session",
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

            // Mode Selector
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkBackground)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf(
                    SessionMode.TIMER to "Timer",
                    SessionMode.POMODORO to "Pomodoro",
                    SessionMode.STOPWATCH to "Stopwatch"
                ).forEach { (mode, label) ->
                    val isSelected = selectedMode == mode
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) AquaGlow else Color.Transparent)
                            .clickable { selectedMode = mode }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) DarkBackground else TextSecondary,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }

            // Duration Presets (for Timer / Pomodoro)
            if (selectedMode != SessionMode.STOPWATCH) {
                Column {
                    Text(
                        text = "DURATION",
                        color = TextTertiary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        durationPresets.forEach { min ->
                            val isSelected = selectedDuration == min
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSelected) AquaGlow else DarkBackground)
                                    .clickable { selectedDuration = min }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${min}m",
                                    color = if (isSelected) DarkBackground else TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Tag Selector
            Column {
                Text(
                    text = "SUBJECT TAG",
                    color = TextTertiary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(tags, key = { it.id }) { tag ->
                        val isSelected = tag.id == selectedTagId
                        val tagColor = Color(android.graphics.Color.parseColor(tag.colorHex))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) tagColor.copy(alpha = 0.25f) else DarkBackground)
                                .clickable { selectedTagId = tag.id }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(tagColor)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = tag.name,
                                    color = if (isSelected) tagColor else TextSecondary,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }

            // Soundscape
            Column {
                Text(
                    text = "SOUNDSCAPE",
                    color = TextTertiary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(soundscapes) { sound ->
                        val isSelected = sound == selectedSound
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (isSelected) AquaGlow.copy(alpha = 0.18f) else DarkBackground)
                                .clickable { selectedSound = sound }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = sound,
                                color = if (isSelected) AquaGlow else TextSecondary,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }

            // Strict Mode Toggle
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkBackground),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null,
                            tint = if (strictMode) StrictRed else TextTertiary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Strict Lock",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Blocks quitting until session expires",
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Switch(
                        checked = strictMode,
                        onCheckedChange = { strictMode = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = DarkBackground,
                            checkedTrackColor = StrictRed,
                            uncheckedThumbColor = TextTertiary,
                            uncheckedTrackColor = BorderDark
                        )
                    )
                }
            }

            // Start Button
            Button(
                onClick = {
                    onStartSession(selectedMode, selectedDuration, selectedTagId, strictMode, selectedSound)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(27.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AquaGlow,
                    contentColor = DarkBackground
                )
            ) {
                Icon(imageVector = Icons.Default.PlayArrow, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Enter Deep Focus",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
