package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillwater.focus.model.AppLimit
import com.stillwater.focus.model.BlockConfig
import com.stillwater.focus.theme.*

@Composable
fun LimitsScreen(
    blockConfig: BlockConfig,
    appLimits: List<AppLimit>,
    onUpdateBlockConfig: ((BlockConfig) -> BlockConfig) -> Unit,
    modifier: Modifier = Modifier
) {
    var newWebsite by remember { mutableStateOf("") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 20.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Title
        item {
            Column {
                Text(
                    text = "App & Web Limits",
                    color = TextPrimary,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Prevent doomscrolling and enforce healthy boundaries",
                    color = TextSecondary,
                    fontSize = 13.sp
                )
            }
        }

        // Short-Video Shield Section
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(StrictRed.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Block,
                                contentDescription = "Shield",
                                tint = StrictRed,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Short-Video Shield",
                                color = TextPrimary,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Detects & closes algorithmic feeds automatically",
                                color = TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Shield items
                    ShieldToggleRow(
                        title = "Block YouTube Shorts",
                        subtitle = "Redirects back to subscriptions or home",
                        checked = blockConfig.blockShorts,
                        onCheckedChange = { checked ->
                            onUpdateBlockConfig { it.copy(blockShorts = checked) }
                        }
                    )

                    HorizontalDivider(color = BorderDark, modifier = Modifier.padding(vertical = 10.dp))

                    ShieldToggleRow(
                        title = "Block Instagram Reels",
                        subtitle = "Shields endless reel recommendations",
                        checked = blockConfig.blockReels,
                        onCheckedChange = { checked ->
                            onUpdateBlockConfig { it.copy(blockReels = checked) }
                        }
                    )

                    HorizontalDivider(color = BorderDark, modifier = Modifier.padding(vertical = 10.dp))

                    ShieldToggleRow(
                        title = "Block TikTok & Spotlight",
                        subtitle = "Locks short video swipe interfaces",
                        checked = blockConfig.blockSpotlight,
                        onCheckedChange = { checked ->
                            onUpdateBlockConfig { it.copy(blockSpotlight = checked) }
                        }
                    )
                }
            }
        }

        // Daily App Limits Section
        item {
            Text(
                text = "DAILY APP TIME LIMITS",
                color = TextTertiary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        items(appLimits, key = { it.appId }) { appLimit ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = appLimit.appName,
                            color = TextPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 15.sp
                        )
                        Text(
                            text = "${appLimit.dailyMin} minutes / day",
                            color = AquaGlow,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    if (appLimit.strict) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = StrictRed.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "STRICT",
                                color = StrictRed,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }

        // Distraction Websites
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Distraction Websites",
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Browser-level URL protection",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    blockConfig.blockedWebsites.forEach { domain ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Public,
                                    contentDescription = null,
                                    tint = TextSecondary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = domain,
                                    color = TextPrimary,
                                    fontSize = 14.sp
                                )
                            }
                            IconButton(
                                onClick = {
                                    onUpdateBlockConfig { cfg ->
                                        cfg.copy(blockedWebsites = cfg.blockedWebsites.filter { it != domain })
                                    }
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove",
                                    tint = TextTertiary,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = newWebsite,
                            onValueChange = { newWebsite = it },
                            placeholder = { Text("e.g. news.ycombinator.com", fontSize = 12.sp) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                focusedBorderColor = AquaGlow,
                                unfocusedBorderColor = BorderDark
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        FilledTonalButton(
                            onClick = {
                                if (newWebsite.isNotBlank()) {
                                    val cleaned = newWebsite.trim().lowercase()
                                    onUpdateBlockConfig { cfg ->
                                        if (!cfg.blockedWebsites.contains(cleaned)) {
                                            cfg.copy(blockedWebsites = cfg.blockedWebsites + cleaned)
                                        } else cfg
                                    }
                                    newWebsite = ""
                                }
                            },
                            colors = ButtonDefaults.filledTonalButtonColors(
                                containerColor = AquaGlow.copy(alpha = 0.15f),
                                contentColor = AquaGlow
                            )
                        ) {
                            Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ShieldToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = subtitle,
                color = TextSecondary,
                fontSize = 11.sp
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = DarkBackground,
                checkedTrackColor = AquaGlow,
                uncheckedThumbColor = TextTertiary,
                uncheckedTrackColor = BorderDark
            )
        )
    }
}
