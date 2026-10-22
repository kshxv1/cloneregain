package com.stillwater.focus.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryAqua,
    onPrimary = PrimaryInk,
    secondary = AccentViolet,
    background = BgDark,
    onBackground = TextLight,
    surface = SurfaceDark,
    onSurface = TextLight,
    surfaceVariant = SurfaceVariantDark,
    onSurfaceVariant = TextMuted,
    outline = BorderDark,
    error = DangerRed
)

@Composable
fun StillwaterTheme(
    accentColor: Color = PrimaryAqua,
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme.copy(
        primary = accentColor
    )

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
