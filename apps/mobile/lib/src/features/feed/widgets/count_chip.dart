import 'package:flutter/material.dart';

import '../../../i18n/index.dart';
import '../../../theme/app_theme.dart';

class CountChip extends StatelessWidget {
  const CountChip({super.key, required this.count, required this.strings});

  final int count;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colors.accent.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFF1C5A73)),
      ),
      child: Text(
        strings.itemsCount(count),
        style: Theme.of(
          context,
        ).textTheme.labelSmall?.copyWith(color: colors.accent),
      ),
    );
  }
}
