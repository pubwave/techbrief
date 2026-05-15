import 'package:flutter/material.dart';

enum AppThemeId {
  currentTheme('current-theme'),
  editorialDawn('editorial-dawn'),
  auroraGlass('aurora-glass');

  const AppThemeId(this.storageValue);

  final String storageValue;
}

AppThemeId appThemeIdFromStorage(String? value) {
  return AppThemeId.values.firstWhere(
    (theme) => theme.storageValue == value,
    orElse: () => AppThemeId.currentTheme,
  );
}

class AppThemeOption {
  const AppThemeOption({
    required this.id,
    required this.preview,
  });

  final AppThemeId id;
  final List<Color> preview;
}

const List<AppThemeOption> appThemeOptions = <AppThemeOption>[
  AppThemeOption(
    id: AppThemeId.currentTheme,
    preview: <Color>[Color(0xFF081522), Color(0xFF0D1C2C), Color(0xFF35D6FF)],
  ),
  AppThemeOption(
    id: AppThemeId.editorialDawn,
    preview: <Color>[Color(0xFFF3EEE4), Color(0xFFFFF9EF), Color(0xFF2A7FFF)],
  ),
  AppThemeOption(
    id: AppThemeId.auroraGlass,
    preview: <Color>[Color(0xFF123740), Color(0xFF183947), Color(0xFF74F7D5)],
  ),
];

class _ThemePalette {
  const _ThemePalette({
    required this.brightness,
    required this.background,
    required this.backgroundAlt,
    required this.surface,
    required this.surfaceCard,
    required this.surfaceCardAlt,
    required this.surfaceInput,
    required this.border,
    required this.borderStrong,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.textTag,
    required this.accent,
    required this.accentInk,
    required this.cardShadow,
  });

  final Brightness brightness;
  final Color background;
  final Color backgroundAlt;
  final Color surface;
  final Color surfaceCard;
  final Color surfaceCardAlt;
  final Color surfaceInput;
  final Color border;
  final Color borderStrong;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color textTag;
  final Color accent;
  final Color accentInk;
  final Color cardShadow;
}

const Map<AppThemeId, _ThemePalette> _themePalettes = <AppThemeId, _ThemePalette>{
  AppThemeId.currentTheme: _ThemePalette(
    brightness: Brightness.dark,
    background: Color(0xFF06111D),
    backgroundAlt: Color(0xFF040B12),
    surface: Color(0xFF081522),
    surfaceCard: Color(0xFF0D1C2C),
    surfaceCardAlt: Color(0xFF0E2436),
    surfaceInput: Color(0xFF0A1928),
    border: Color(0xFF17324A),
    borderStrong: Color(0xFF1B425F),
    textPrimary: Color(0xFFEAF6FF),
    textSecondary: Color(0xFF86A8BF),
    textMuted: Color(0xFF5E7C91),
    textTag: Color(0xFFDBEEF9),
    accent: Color(0xFF35D6FF),
    accentInk: Color(0xFF04111B),
    cardShadow: Color(0x1F35D6FF),
  ),
  AppThemeId.editorialDawn: _ThemePalette(
    brightness: Brightness.light,
    background: Color(0xFFF7F1E7),
    backgroundAlt: Color(0xFFEFE4D4),
    surface: Color(0xFFF8F2E7),
    surfaceCard: Color(0xFFFFF9EF),
    surfaceCardAlt: Color(0xFFECE5D9),
    surfaceInput: Color(0xFFF3EEE4),
    border: Color(0xFFD9D0BF),
    borderStrong: Color(0xFFB8C9E8),
    textPrimary: Color(0xFF1F2C3A),
    textSecondary: Color(0xFF5F6F82),
    textMuted: Color(0xFF857E72),
    textTag: Color(0xFF304968),
    accent: Color(0xFF2A7FFF),
    accentInk: Color(0xFFF7FBFF),
    cardShadow: Color(0x242A7FFF),
  ),
  AppThemeId.auroraGlass: _ThemePalette(
    brightness: Brightness.dark,
    background: Color(0xFF07151A),
    backgroundAlt: Color(0xFF0A1F26),
    surface: Color(0xFF123740),
    surfaceCard: Color(0xFF183947),
    surfaceCardAlt: Color(0xFF10313A),
    surfaceInput: Color(0xFF0A1F28),
    border: Color(0xFF245463),
    borderStrong: Color(0xFF35798D),
    textPrimary: Color(0xFFE8FFFB),
    textSecondary: Color(0xFF91C4C9),
    textMuted: Color(0xFF5E8B92),
    textTag: Color(0xFFD2FFF7),
    accent: Color(0xFF74F7D5),
    accentInk: Color(0xFF06211D),
    cardShadow: Color(0x2974F7D5),
  ),
};

ThemeData buildTechBriefTheme([AppThemeId themeId = AppThemeId.currentTheme]) {
  final palette = _themePalettes[themeId]!;
  final colorScheme = ColorScheme.fromSeed(
    seedColor: palette.accent,
    brightness: palette.brightness,
    surface: palette.surface,
  );

  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: palette.background,
    colorScheme: colorScheme.copyWith(
      brightness: palette.brightness,
      primary: palette.accent,
      surface: palette.surface,
    ),
    textTheme: TextTheme(
      headlineMedium: TextStyle(
        color: palette.textPrimary,
        fontSize: 20,
        fontWeight: FontWeight.w800,
        height: 1.2,
      ),
      headlineSmall: TextStyle(
        color: palette.textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w700,
        height: 1.3,
      ),
      bodyLarge: TextStyle(
        color: palette.textSecondary,
        fontSize: 15,
        height: 1.6,
      ),
      bodyMedium: TextStyle(
        color: palette.textSecondary,
        fontSize: 13,
        height: 1.45,
      ),
      labelLarge: TextStyle(
        color: palette.textPrimary,
        fontSize: 12,
        fontWeight: FontWeight.w700,
      ),
      labelSmall: TextStyle(
        color: palette.textMuted,
        fontSize: 10,
        letterSpacing: 0.4,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: palette.surfaceInput,
      hintStyle: TextStyle(color: palette.textMuted, fontSize: 13),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: palette.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: palette.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: palette.accent),
      ),
    ),
    cardTheme: CardThemeData(
      color: palette.surfaceCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: palette.border),
      ),
      margin: EdgeInsets.zero,
    ),
    iconTheme: IconThemeData(color: palette.textMuted),
    dividerColor: palette.border,
    extensions: <ThemeExtension<dynamic>>[
      TechBriefColors(
        background: palette.background,
        backgroundAlt: palette.backgroundAlt,
        surface: palette.surface,
        surfaceCard: palette.surfaceCard,
        surfaceCardAlt: palette.surfaceCardAlt,
        border: palette.border,
        borderStrong: palette.borderStrong,
        textPrimary: palette.textPrimary,
        textSecondary: palette.textSecondary,
        textMuted: palette.textMuted,
        textTag: palette.textTag,
        accent: palette.accent,
        accentInk: palette.accentInk,
        cardShadow: palette.cardShadow,
      ),
    ],
  );
}

@immutable
class TechBriefColors extends ThemeExtension<TechBriefColors> {
  const TechBriefColors({
    required this.background,
    required this.backgroundAlt,
    required this.surface,
    required this.surfaceCard,
    required this.surfaceCardAlt,
    required this.border,
    required this.borderStrong,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.textTag,
    required this.accent,
    required this.accentInk,
    required this.cardShadow,
  });

  final Color background;
  final Color backgroundAlt;
  final Color surface;
  final Color surfaceCard;
  final Color surfaceCardAlt;
  final Color border;
  final Color borderStrong;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color textTag;
  final Color accent;
  final Color accentInk;
  final Color cardShadow;

  @override
  TechBriefColors copyWith({
    Color? background,
    Color? backgroundAlt,
    Color? surface,
    Color? surfaceCard,
    Color? surfaceCardAlt,
    Color? border,
    Color? borderStrong,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? textTag,
    Color? accent,
    Color? accentInk,
    Color? cardShadow,
  }) {
    return TechBriefColors(
      background: background ?? this.background,
      backgroundAlt: backgroundAlt ?? this.backgroundAlt,
      surface: surface ?? this.surface,
      surfaceCard: surfaceCard ?? this.surfaceCard,
      surfaceCardAlt: surfaceCardAlt ?? this.surfaceCardAlt,
      border: border ?? this.border,
      borderStrong: borderStrong ?? this.borderStrong,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      textTag: textTag ?? this.textTag,
      accent: accent ?? this.accent,
      accentInk: accentInk ?? this.accentInk,
      cardShadow: cardShadow ?? this.cardShadow,
    );
  }

  @override
  TechBriefColors lerp(ThemeExtension<TechBriefColors>? other, double t) {
    if (other is! TechBriefColors) {
      return this;
    }

    return TechBriefColors(
      background: Color.lerp(background, other.background, t) ?? background,
      backgroundAlt: Color.lerp(backgroundAlt, other.backgroundAlt, t) ?? backgroundAlt,
      surface: Color.lerp(surface, other.surface, t) ?? surface,
      surfaceCard: Color.lerp(surfaceCard, other.surfaceCard, t) ?? surfaceCard,
      surfaceCardAlt: Color.lerp(surfaceCardAlt, other.surfaceCardAlt, t) ?? surfaceCardAlt,
      border: Color.lerp(border, other.border, t) ?? border,
      borderStrong: Color.lerp(borderStrong, other.borderStrong, t) ?? borderStrong,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t) ?? textPrimary,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t) ?? textSecondary,
      textMuted: Color.lerp(textMuted, other.textMuted, t) ?? textMuted,
      textTag: Color.lerp(textTag, other.textTag, t) ?? textTag,
      accent: Color.lerp(accent, other.accent, t) ?? accent,
      accentInk: Color.lerp(accentInk, other.accentInk, t) ?? accentInk,
      cardShadow: Color.lerp(cardShadow, other.cardShadow, t) ?? cardShadow,
    );
  }
}
