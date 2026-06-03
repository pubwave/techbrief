import 'package:flutter/material.dart';
import '../../model/channel_filter.dart';
import '../../theme/palette.dart';

class ChannelTabs extends StatelessWidget {
  const ChannelTabs({
    super.key,
    required this.palette,
    required this.selected,
    required this.onChanged,
    required this.labels,
  });

  final AppPalette palette;
  final ChannelFilter selected;
  final ValueChanged<ChannelFilter> onChanged;
  final Map<ChannelFilter, String> labels;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 36,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          for (final filter in ChannelFilter.values)
            Padding(
              padding: const EdgeInsets.only(right: 6),
              child: _Tab(
                palette: palette,
                label: labels[filter] ?? filter.label,
                active: selected == filter,
                onTap: () => onChanged(filter),
              ),
            ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.palette,
    required this.label,
    required this.active,
    required this.onTap,
  });

  final AppPalette palette;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: active ? palette.accent : palette.surface,
          border: Border.all(
            color: active ? palette.accent : palette.border,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: active ? FontWeight.w600 : FontWeight.w500,
            color: active ? palette.accentInk : palette.textSecondary,
          ),
        ),
      ),
    );
  }
}
