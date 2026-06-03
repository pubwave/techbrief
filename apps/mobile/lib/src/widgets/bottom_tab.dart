import 'package:flutter/material.dart';
import '../theme/palette.dart';

class AppBottomTab extends StatelessWidget {
  const AppBottomTab({
    super.key,
    required this.palette,
    required this.index,
    required this.onChanged,
    required this.labels,
    required this.icons,
  });

  final AppPalette palette;
  final int index;
  final ValueChanged<int> onChanged;
  final List<String> labels;
  final List<IconData> icons;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: palette.surface,
        border: Border(top: BorderSide(color: palette.border)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            children: List.generate(labels.length, (i) {
              final active = i == index;
              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onChanged(i),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        icons[i],
                        size: 22,
                        color: active ? palette.accent : palette.textMuted,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        labels[i],
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: active ? palette.accent : palette.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
