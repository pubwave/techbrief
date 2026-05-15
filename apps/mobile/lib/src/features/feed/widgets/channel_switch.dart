import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';

class ChannelSwitch extends StatelessWidget {
  const ChannelSwitch({
    super.key,
    required this.labels,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<String> labels;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return Row(
      children: List<Widget>.generate(labels.length, (index) {
        final selected = selectedIndex == index;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index == 0 ? 8 : 0),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => onSelected(index),
              child: Ink(
                padding: const EdgeInsets.symmetric(
                  vertical: 10,
                  horizontal: 12,
                ),
                decoration: BoxDecoration(
                  color: selected ? colors.accent : colors.surfaceCardAlt,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: selected ? Colors.transparent : colors.border,
                  ),
                ),
                child: Text(
                  labels[index],
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    fontSize: 12,
                    color: selected
                        ? const Color(0xFF04111B)
                        : colors.textSecondary,
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
