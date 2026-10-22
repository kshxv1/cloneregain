package com.stillwater.focus.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.model.ActiveSession
import com.stillwater.focus.model.SessionMode
import com.stillwater.focus.model.Tag
import com.stillwater.focus.theme.*
import kotlinx.coroutines.delay
import java.util.Locale

@Composable
fun ActiveSessionScreen(
    session: ActiveSession,
    tag: Tag?,
    emergencyAllowed: Boolean,
    onPauseToggle: () -> Unit,
    onEndSession: () -> Unit,
    modifier: Modifier = Modifier
) {
    var currentTime by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var holdProgress by remember { mutableFloatStateOf(0f) }
    var isHolding by remember { mutableStateOf(false) }

    LaunchedEffect(session.isPaused) {
        while (true) {
            if (!session.isPaused) {
                currentTime = System.currentTimeMillis()
            }
            delay(1000L)
        }
    }

    LaunchedEffect(isHolding) {
        if (isHolding) {
            val startTime = System.currentTimeMillis()
            val totalDuration = 5000L
            while (isHolding && holdProgress < 1f) {
                val elapsed = System.currentTimeMillis() - startTime
                holdProgress = (elapsed.toFloat() / totalDuration).coerceIn(0f, 1f)
                if (holdProgress >= 1f) {
                    onEndSession()
                    break
                }
                delay(50L)
            }
        } else {
            holdProgress = 0f
        }
    }

    val elapsedSeconds = ((currentTime - session.startedAt) / 1000L).coerceAtLeast(0L)
    val totalSeconds = (session.targetDurationMin * 60L).coerceAtLeast(1L)
    val remainingSeconds = when (session.mode) {
        SessionMode.TIMER, SessionMode.POMODORO -> (totalSeconds - elapsedSeconds).coerceAtLeast(0L)
        SessionMode.STOPWATCH -> elapsedSeconds
    }

    val progress = when (session.mode) {
        SessionMode.STOPWATCH -> 1f
        else -> (elapsedSeconds.toFloat() / totalSeconds.toFloat()).coerceIn(0f, 1f)
    }

    val minutes = remainingSeconds / 60
    val seconds = remainingSeconds % 60
    val timeDisplay = String.format(Locale.US, "%02d:%02d", minutes, seconds)

    // Breathing pulse animation
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.97f,
        targetValue = 1.03f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top Bar: Mode & Strict badge
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tag pill
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(SurfaceDark)
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(Color(android.graphics.Color.parseColor(tag?.colorHex ?: "#5EEAD4")))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = tag?.name ?: "Focus",
                        color = TextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Strict Mode badge
                if (session.strict) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(StrictRed.copy(alpha = 0.15f))
                            .border(1.dp, StrictRed.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Strict Mode",
                            tint = StrictRed,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "STRICT LOCK",
                            color = StrictRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    }
                }
            }

            // Center: Breathing Ripple Circle & Countdown Timer
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(280.dp)
                    .scale(if (session.isPaused) 1f else pulseScale)
            ) {
                // Background ripple layers
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape)
                        .background(AquaGlow.copy(alpha = 0.05f))
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize(0.85f)
                        .clip(CircleShape)
                        .background(AquaGlow.copy(alpha = 0.08f))
                )

                // Circular Progress Ring
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxSize(0.72f),
                    color = AquaGlow,
                    trackColor = BorderDark,
                    strokeWidth = 6.dp
                )

                // Timer numbers
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = timeDisplay,
                        color = TextPrimary,
                        fontSize = 52.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-1).sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (session.isPaused) "PAUSED" else if (session.mode == SessionMode.POMODORO) "POMODORO CYCLE ${session.pomodoroCycle}" else "STAY WITH THE FLOW",
                        color = if (session.isPaused) StrictRed else TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.sp
                    )
                }
            }

            // Soundscape & Session details
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceDark)
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MusicNote,
                        contentDescription = "Soundscape",
                        tint = AquaGlow,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = session.ambientSound.ifEmpty { "Stream Waters" },
                        color = TextSecondary,
                        fontSize = 13.sp
                    )
                }
            }

            // Bottom Controls
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (session.strict && !emergencyAllowed) {
                    // Unbreakable strict mode
                    Text(
                        text = "Unbreakable Mode: All distractions are blocked until time expires.",
                        color = TextTertiary,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 24.dp)
                    )
                } else if (session.strict && emergencyAllowed) {
                    // 5-second hold to emergency unlock
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = if (isHolding) "Hold 5s to unlock (${(5 - (holdProgress * 5)).toInt()}s)..." else "Press and hold 5s for emergency exit",
                            color = TextTertiary,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .clip(RoundedCornerShape(26.dp))
                                .background(BorderDark)
                                .pointerInput(Unit) {
                                    detectTapGestures(
                                        onPress = {
                                            isHolding = true
                                            tryAwaitRelease()
                                            isHolding = false
                                        }
                                    )
                                }
                        ) {
                            // Progress fill
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(holdProgress)
                                    .align(Alignment.CenterStart)
                                    .background(StrictRed.copy(alpha = 0.6f))
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = "Emergency Unlock",
                                    tint = StrictRed,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "EMERGENCY UNLOCK",
                                    color = TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                } else {
                    // Standard session controls: Pause/Resume + Finish
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedButton(
                            onClick = onPauseToggle,
                            modifier = Modifier
                                .weight(1f)
                                .height(52.dp),
                            shape = RoundedCornerShape(26.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = TextPrimary
                            )
                        ) {
                            Icon(
                                imageVector = if (session.isPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                                contentDescription = if (session.isPaused) "Resume" else "Pause"
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(if (session.isPaused) "Resume" else "Pause", fontWeight = FontWeight.SemiBold)
                        }

                        Button(
                            onClick = onEndSession,
                            modifier = Modifier
                                .weight(1f)
                                .height(52.dp),
                            shape = RoundedCornerShape(26.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AquaGlow,
                                contentColor = DarkBackground
                            )
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = "Complete")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Finish", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
