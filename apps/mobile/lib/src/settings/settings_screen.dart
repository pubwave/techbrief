import 'package:flutter/material.dart';
import '../i18n/app_strings.dart';
import '../theme/palette.dart';
import 'widgets/theme_picker.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
    required this.palette,
    required this.selectedTheme,
    required this.onThemeChanged,
  });

  final AppPalette palette;
  final AppThemeId selectedTheme;
  final ValueChanged<AppThemeId> onThemeChanged;

  @override
  Widget build(BuildContext context) {
    final p = palette;
    final s = AppStrings.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            s.settings.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.1,
              color: p.accent,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            s.workspaceSettings,
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: p.text,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            s.workspaceSettingsDesc,
            style: TextStyle(
              fontSize: 13,
              color: p.textSecondary,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 20),
          ThemePicker(
            palette: p,
            selected: selectedTheme,
            onChanged: onThemeChanged,
          ),
        ],
      ),
    );
  }
}
