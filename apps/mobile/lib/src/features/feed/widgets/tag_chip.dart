import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';

class TagChip extends StatelessWidget {
  const TagChip({super.key, required this.label, this.accent = false});

  final String label;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
      decoration: BoxDecoration(
        color: colors.surfaceCardAlt,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: accent ? colors.accent : colors.textPrimary,
        ),
      ),
    );
  }
}
