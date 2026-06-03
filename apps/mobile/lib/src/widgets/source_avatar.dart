import 'package:flutter/material.dart';

class SourceAvatar extends StatelessWidget {
  const SourceAvatar({
    super.key,
    required this.sourceName,
    this.size = 22,
    this.fontSize = 9,
  });

  final String sourceName;
  final double size;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final initials = _initials(sourceName);
    final color = _colorForName(sourceName);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          height: 1,
        ),
      ),
    );
  }
}

String _initials(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) return '?';
  final words = trimmed.split(RegExp(r'\s+'));
  if (words.length >= 2) {
    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }
  // Use the trimmed value (not the original) so leading whitespace never leaks
  // into the initials — matches the web SourceAvatar.
  return trimmed.substring(0, trimmed.length.clamp(0, 2)).toUpperCase();
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
