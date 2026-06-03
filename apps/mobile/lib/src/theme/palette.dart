import 'package:flutter/material.dart';

enum AppThemeId {
  current('current', 'Current Theme'),
  dawn('dawn', 'Editorial Dawn'),
  aurora('aurora', 'Aurora Glass');

  const AppThemeId(this.value, this.label);

  final String value;
  final String label;

  static AppThemeId fromValue(String? value) => AppThemeId.values.firstWhere(
    (t) => t.value == value,
    orElse: () => AppThemeId.current,
  );
}

class AppPalette {
  const AppPalette({
    required this.id,
    required this.background,
    required this.backgroundAlt,
    required this.surface,
    required this.surfaceCard,
    required this.surfaceCardHover,
    required this.surfaceInput,
    required this.border,
    required this.borderStrong,
    required this.text,
    required this.textSecondary,
    required this.textMuted,
    required this.accent,
    required this.accentSoft,
    required this.accentInk,
    required this.tagChannelBg,
    required this.tagChannelBorder,
    required this.tagChannelText,
  });

  final AppThemeId id;
  final Color background;
  final Color backgroundAlt;
  final Color surface;
  final Color surfaceCard;
  final Color surfaceCardHover;
  final Color surfaceInput;
  final Color border;
  final Color borderStrong;
  final Color text;
  final Color textSecondary;
  final Color textMuted;
  final Color accent;
  final Color accentSoft;
  final Color accentInk;
  final Color tagChannelBg;
  final Color tagChannelBorder;
  final Color tagChannelText;

  bool get isDark => id != AppThemeId.dawn;

  List<Color> get swatches => <Color>[surface, surfaceCard, accent];

  Map<String, dynamic> toReaderTheme() => <String, dynamic>{
    'colors': <String, String>{
      'background': 'transparent',
      'text': _hex(text),
      'textMuted': _hex(textMuted),
      'border': 'transparent',
      'primary': _hex(accent),
      'linkColor': _hex(accent),
    },
    'locale': 'zh-CN',
  };
}

extension AppPaletteLookup on AppThemeId {
  AppPalette get palette {
    switch (this) {
      case AppThemeId.current:
        return const AppPalette(
          id: AppThemeId.current,
          background: Color(0xFF06111D),
          backgroundAlt: Color(0xFF040B12),
          surface: Color(0xFF081522),
          surfaceCard: Color(0xFF0D1C2C),
          surfaceCardHover: Color(0xFF0E2030),
          surfaceInput: Color(0xFF0A1928),
          border: Color(0xFF17324A),
          borderStrong: Color(0xFF1B425F),
          text: Color(0xFFEAF6FF),
          textSecondary: Color(0xFF86A8BF),
          textMuted: Color(0xFF5E7C91),
          accent: Color(0xFF35D6FF),
          accentSoft: Color(0x1F35D6FF),
          accentInk: Color(0xFF04111B),
          tagChannelBg: Color(0x1A35D6FF),
          tagChannelBorder: Color(0x4D35D6FF),
          tagChannelText: Color(0xFF35D6FF),
        );
      case AppThemeId.dawn:
        return const AppPalette(
          id: AppThemeId.dawn,
          background: Color(0xFFF7F1E7),
          backgroundAlt: Color(0xFFEFE4D4),
          surface: Color(0xFFF8F2E7),
          surfaceCard: Color(0xFFFFF9EF),
          surfaceCardHover: Color(0xFFECE5D9),
          surfaceInput: Color(0xFFF3EEE4),
          border: Color(0xFFD9D0BF),
          borderStrong: Color(0xFFB8C9E8),
          text: Color(0xFF1F2C3A),
          textSecondary: Color(0xFF5F6F82),
          textMuted: Color(0xFF857E72),
          accent: Color(0xFF2A7FFF),
          accentSoft: Color(0x1F2A7FFF),
          accentInk: Color(0xFFF7FBFF),
          tagChannelBg: Color(0x1A2A7FFF),
          tagChannelBorder: Color(0x4D2A7FFF),
          tagChannelText: Color(0xFF2A7FFF),
        );
      case AppThemeId.aurora:
        return const AppPalette(
          id: AppThemeId.aurora,
          background: Color(0xFF07151A),
          backgroundAlt: Color(0xFF0A1F26),
          surface: Color(0xFF123740),
          surfaceCard: Color(0xFF183947),
          surfaceCardHover: Color(0xFF1E4554),
          surfaceInput: Color(0xFF0A1F28),
          border: Color(0xFF245463),
          borderStrong: Color(0xFF35798D),
          text: Color(0xFFE8FFFB),
          textSecondary: Color(0xFF91C4C9),
          textMuted: Color(0xFF5E8B92),
          accent: Color(0xFF74F7D5),
          accentSoft: Color(0x1F74F7D5),
          accentInk: Color(0xFF06211D),
          tagChannelBg: Color(0x1A74F7D5),
          tagChannelBorder: Color(0x4D74F7D5),
          tagChannelText: Color(0xFF74F7D5),
        );
    }
  }
}

String _hex(Color color) {
  final rgb = color.toARGB32() & 0xFFFFFF;
  return '#${rgb.toRadixString(16).padLeft(6, '0')}';
}
