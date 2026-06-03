import 'package:flutter/material.dart';
import 'palette.dart';

ThemeData buildMaterialTheme(AppThemeId id) {
  final p = id.palette;
  final base = p.isDark ? ThemeData.dark() : ThemeData.light();
  return base.copyWith(
    scaffoldBackgroundColor: p.background,
    colorScheme: base.colorScheme.copyWith(
      brightness: p.isDark ? Brightness.dark : Brightness.light,
      primary: p.accent,
      secondary: p.accent,
      surface: p.surfaceCard,
      onSurface: p.text,
    ),
    textTheme: base.textTheme.apply(
      bodyColor: p.text,
      displayColor: p.text,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: p.surfaceInput,
      hintStyle: TextStyle(color: p.textMuted, fontSize: 13),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: p.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: p.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: p.accent),
      ),
    ),
  );
}
