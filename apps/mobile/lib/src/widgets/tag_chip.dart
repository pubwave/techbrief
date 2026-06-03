import 'package:flutter/material.dart';
import '../theme/palette.dart';

class ChannelTagChip extends StatelessWidget {
  const ChannelTagChip({super.key, required this.label, required this.palette});

  final String label;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: palette.tagChannelBg,
        border: Border.all(color: palette.tagChannelBorder),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: palette.tagChannelText,
          letterSpacing: 0.02,
        ),
      ),
    );
  }
}

class SourceTagChip extends StatelessWidget {
  const SourceTagChip({
    super.key,
    required this.label,
    required this.sourceName,
  });

  final String label;
  final String sourceName;

  @override
  Widget build(BuildContext context) {
    final color = _colorForName(sourceName);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: color,
          letterSpacing: 0.02,
        ),
      ),
    );
  }
}

Color _colorForName(String name) {
  const colors = <Color>[
    Color(0xFF0284C7),
    Color(0xFF7C3AED),
    Color(0xFF059669),
    Color(0xFFDC2626),
    Color(0xFFD97706),
    Color(0xFF2563EB),
    Color(0xFF9333EA),
    Color(0xFF16A34A),
    Color(0xFFB91C1C),
    Color(0xFF0891B2),
  ];
  var hash = 0;
  for (final ch in name.codeUnits) {
    hash = (hash * 31 + ch) & 0x7FFFFFFF;
  }
  return colors[hash % colors.length];
}
