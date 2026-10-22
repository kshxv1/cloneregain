package com.stillwater.focus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.stillwater.focus.model.Member
import com.stillwater.focus.model.Room
import com.stillwater.focus.theme.*

@Composable
fun RoomsScreen(
    rooms: List<Room>,
    modifier: Modifier = Modifier
) {
    var selectedRoomId by remember { mutableStateOf(rooms.firstOrNull()?.id ?: "") }
    val activeRoom = rooms.find { it.id == selectedRoomId } ?: rooms.firstOrNull()
    var cheeredMembers by remember { mutableStateOf(setOf<String>()) }

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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Study Rooms",
                        color = TextPrimary,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Silent co-working with mutual accountability",
                        color = TextSecondary,
                        fontSize = 13.sp
                    )
                }

                FilledTonalButton(
                    onClick = { /* Join code dialog */ },
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = AquaGlow.copy(alpha = 0.15f),
                        contentColor = AquaGlow
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.GroupAdd,
                        contentDescription = "Join Room",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Join", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Room Selector Pills
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rooms.forEach { room ->
                    val isSelected = room.id == activeRoom?.id
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (isSelected) AquaGlow else SurfaceDark)
                            .clickable { selectedRoomId = room.id }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = room.name,
                            color = if (isSelected) DarkBackground else TextPrimary,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Active Room Details Card
        if (activeRoom != null) {
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = activeRoom.name,
                                    color = TextPrimary,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = activeRoom.subject,
                                    color = AquaGlow,
                                    fontSize = 13.sp
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = BorderDark
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Tag,
                                        contentDescription = null,
                                        tint = TextSecondary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = activeRoom.code,
                                        color = TextPrimary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        val activeFocusers = activeRoom.members.count { it.status == "focusing" }
                        Text(
                            text = "$activeFocusers of ${activeRoom.members.size} members in deep flow right now",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Member list header
            item {
                Text(
                    text = "POD MEMBERS (${activeRoom.members.size})",
                    color = TextTertiary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // Members
            items(activeRoom.members, key = { it.id }) { member ->
                val hasCheered = cheeredMembers.contains(member.id)
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color(android.graphics.Color.parseColor(member.colorHex))),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = member.name.take(1),
                                    color = DarkBackground,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = member.name,
                                    color = TextPrimary,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (member.status == "focusing") AquaGlow else StreakAmber)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = if (member.status == "focusing") "Focusing on ${member.currentTag}" else "On short break",
                                        color = TextSecondary,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "${member.todayMin}m",
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            IconButton(
                                onClick = {
                                    cheeredMembers = if (hasCheered) cheeredMembers - member.id else cheeredMembers + member.id
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Favorite,
                                    contentDescription = "Cheer",
                                    tint = if (hasCheered) StrictRed else TextTertiary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
