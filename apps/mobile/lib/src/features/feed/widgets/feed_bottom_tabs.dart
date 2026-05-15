import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';

class FeedBottomTabs extends StatelessWidget {
  const FeedBottomTabs({
    super.key,
    required this.currentIndex,
    required this.onChanged,
    required this.labels,
  });

  final int currentIndex;
  final ValueChanged<int> onChanged;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: colors.surfaceCardAlt,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: colors.border),
      ),
      child: Row(
        children: List<Widget>.generate(labels.length, (index) {
          final selected = currentIndex == index;
          return Expanded(
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => onChanged(index),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Text(
                  labels[index],
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: selected ? colors.accent : colors.textMuted,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
