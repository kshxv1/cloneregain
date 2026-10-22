package com.stillwater.focus.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.ArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.theme.*

@Composable
fun StillwaterLogo(
    modifier: Modifier = Modifier,
    size: Int = 36
) {
    Canvas(modifier = modifier.size(size.dp)) {
        val center = androidx.compose.ui.geometry.Offset(this.size.width / 2f, this.size.height / 2f)
        val maxRadius = this.size.width / 2f

        // Outer ripple
        drawCircle(
            color = PrimaryAqua.copy(alpha = 0.3f),
            radius = maxRadius * 0.9f,
            center = center,
            style = Stroke(width = 2.dp.toPx())
        )
        // Mid ripple
        drawCircle(
            color = PrimaryAqua.copy(alpha = 0.6f),
            radius = maxRadius * 0.6f,
            center = center,
            style = Stroke(width = 3.dp.toPx())
        )
        // Center stillness droplet
        drawCircle(
            color = PrimaryAqua,
            radius = maxRadius * 0.25f,
            center = center
        )
    }
}

@Composable
fun CircularProgressRing(
    progress: Float,
    displayTime: String,
    goalText: String,
    onArrowClick: () -> Unit,
    onGoalClick: () -> Unit,
    modifier: Modifier = Modifier,
    ringSize: androidx.compose.ui.unit.Dp = 260.dp,
    strokeWidthDp: androidx.compose.ui.unit.Dp = 22.dp,
    timeFontSize: androidx.compose.ui.unit.TextUnit = 42.sp,
    accentColor: Color = PrimaryAqua
) {
    val animatedProgress by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = tween(durationMillis = 800),
        label = "progress"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(ringSize)
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(10.dp)) {
            val strokeWidthPx = strokeWidthDp.toPx()
            val diameter = size.minDimension - strokeWidthPx
            val topLeft = androidx.compose.ui.geometry.Offset(strokeWidthPx / 2, strokeWidthPx / 2)
            val arcSize = androidx.compose.ui.geometry.Size(diameter, diameter)

            // Background track
            drawArc(
                color = SurfaceVariantDark,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidthPx)
            )

            // Progress Arc
            if (animatedProgress > 0f) {
                drawArc(
                    color = accentColor,
                    startAngle = -90f,
                    sweepAngle = animatedProgress * 360f,
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = Stroke(width = strokeWidthPx, cap = StrokeCap.Round)
                )
            }
        }

        // Top arrow button affordance
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .size(36.dp)
                .clip(CircleShape)
                .background(accentColor)
                .clickable { onArrowClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "View Statistics",
                tint = PrimaryInk,
                modifier = Modifier.size(18.dp)
            )
        }

        // Center Content
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = displayTime,
                fontSize = timeFontSize,
                fontWeight = FontWeight.Bold,
                color = TextLight
            )
            Spacer(modifier = Modifier.height(4.dp))
            Surface(
                color = SurfaceVariantDark.copy(alpha = 0.7f),
                shape = CircleShape,
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onGoalClick() }
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.TrackChanges,
                        contentDescription = "Goal",
                        tint = accentColor,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = goalText,
                        fontSize = 12.sp,
                        color = TextLight,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun ScreenTimeCard(
    totalMin: Int,
    productiveMin: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val totalHours = totalMin / 60
    val totalRemMin = totalMin % 60
    val timeLabel = if (totalHours > 0) "${totalHours}h ${totalRemMin}m" else "${totalRemMin}m"
    val productiveFraction = if (totalMin > 0) productiveMin.toFloat() / totalMin.toFloat() else 0.5f

    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = timeLabel,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextLight
                    )
                    Text(
                        text = "Screen Time",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = TextMuted
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Segmented Progress Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(CircleShape)
                    .background(SurfaceVariantDark)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(productiveFraction)
                        .clip(CircleShape)
                        .background(SuccessGreen)
                )
            }
        }
    }
}
