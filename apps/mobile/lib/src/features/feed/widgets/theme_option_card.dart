import 'package:flutter/material.dart';

import '../../../i18n/index.dart';
import '../../../theme/app_theme.dart';

class ThemeOptionCard extends StatelessWidget {
  const ThemeOptionCard({
    super.key,
    required this.option,
    required this.strings,
    required this.selected,
    required this.onTap,
  });

  final AppThemeOption option;
  final AppStrings strings;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? colors.surfaceCardAlt : colors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? colors.borderStrong : colors.border,
          ),
          boxShadow: selected
              ? <BoxShadow>[
                  BoxShadow(
                    color: colors.cardShadow,
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ]
              : const <BoxShadow>[],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    strings.themeLabel(option.id),
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      fontSize: 13,
                      color: colors.textPrimary,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    selected ? strings.active : strings.apply,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: selected ? colors.accent : colors.textMuted,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children:
                  option.preview
                      .map(
                        (color) => Expanded(
                          child: Container(
                            height: 36,
                            margin: const EdgeInsets.only(right: 8),
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      )
                      .toList()
                    ..removeLast(),
            ),
            const SizedBox(height: 12),
            Text(
              strings.themeSummary(option.id),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
