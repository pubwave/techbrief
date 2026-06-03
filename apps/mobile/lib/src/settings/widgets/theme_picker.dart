import 'package:flutter/material.dart';
import '../../i18n/app_strings.dart';
import '../../theme/palette.dart';

class ThemePicker extends StatelessWidget {
  const ThemePicker({
    super.key,
    required this.palette,
    required this.selected,
    required this.onChanged,
  });

  final AppPalette palette;
  final AppThemeId selected;
  final ValueChanged<AppThemeId> onChanged;

  @override
  Widget build(BuildContext context) {
    final p = palette;
    final s = AppStrings.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.surfaceCard,
        border: Border.all(color: p.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            s.theme,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: p.text,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            s.themeDescription,
            style: TextStyle(fontSize: 13, color: p.textSecondary, height: 1.5),
          ),
          const SizedBox(height: 14),
          Row(
            children: AppThemeId.values
                .map((id) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _ThemeCard(
                          themeId: id,
                          palette: p,
                          isSelected: id == selected,
                          onTap: () => onChanged(id),
                          activeLabel: s.active,
                          applyLabel: s.apply,
                          themeLabel: s.themeLabel(id),
                        ),
                      ),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _ThemeCard extends StatelessWidget {
  const _ThemeCard({
    required this.themeId,
    required this.palette,
    required this.isSelected,
    required this.onTap,
    required this.activeLabel,
    required this.applyLabel,
    required this.themeLabel,
  });

  final AppThemeId themeId;
  final AppPalette palette;
  final bool isSelected;
  final VoidCallback onTap;
  final String activeLabel;
  final String applyLabel;
  final String themeLabel;

  @override
  Widget build(BuildContext context) {
    final p = palette;
    final tp = themeId.palette;

    return GestureDetector(
      onTap: isSelected ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.fromLTRB(8, 10, 8, 10),
        decoration: BoxDecoration(
          color: isSelected ? p.surfaceCard : p.surface,
          border: Border.all(
            color: isSelected ? p.accent : p.border,
            width: isSelected ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            // Swatches
            Row(
              children: tp.swatches
                  .map((c) => Expanded(
                        child: Container(
                          height: 28,
                          margin: const EdgeInsets.only(right: 3),
                          decoration: BoxDecoration(
                            color: c,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.1),
                            ),
                          ),
                        ),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 6),
            Text(
              themeLabel.replaceAll(' ', '\n'),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: p.text,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected ? p.accent : p.surfaceInput,
                border: isSelected ? null : Border.all(color: p.border),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                isSelected ? activeLabel : applyLabel,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? p.accentInk : p.textMuted,
                  letterSpacing: 0.02,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
