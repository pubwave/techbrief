import 'package:flutter/material.dart';
import '../../i18n/app_strings.dart';
import '../../theme/palette.dart';

class TranslationBar extends StatefulWidget {
  const TranslationBar({
    super.key,
    required this.palette,
    required this.isTranslating,
    this.error,
  });

  final AppPalette palette;
  final bool isTranslating;
  final String? error;

  @override
  State<TranslationBar> createState() => _TranslationBarState();
}

class _TranslationBarState extends State<TranslationBar>
    with TickerProviderStateMixin {
  late AnimationController _dot1, _dot2, _dot3;

  @override
  void initState() {
    super.initState();
    _dot1 = _makeDot(0);
    _dot2 = _makeDot(150);
    _dot3 = _makeDot(300);
  }

  AnimationController _makeDot(int delayMs) {
    final ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    Future.delayed(Duration(milliseconds: delayMs), () {
      if (mounted) ctrl.repeat(reverse: true);
    });
    return ctrl;
  }

  @override
  void dispose() {
    _dot1.dispose();
    _dot2.dispose();
    _dot3.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.palette;
    final s = AppStrings.of(context);

    if (!widget.isTranslating && widget.error == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: p.surface,
        border: Border(bottom: BorderSide(color: p.border)),
      ),
      child: Row(
        children: widget.error != null
            ? [
                Icon(Icons.error_outline, size: 14, color: p.textMuted),
                const SizedBox(width: 6),
                Text(
                  s.translationFailed,
                  style: TextStyle(fontSize: 12, color: p.textMuted),
                ),
              ]
            : [
                Text(
                  s.translationInProgress,
                  style: TextStyle(fontSize: 12, color: p.accent),
                ),
                const SizedBox(width: 6),
                _Dot(ctrl: _dot1, color: p.accent),
                const SizedBox(width: 3),
                _Dot(ctrl: _dot2, color: p.accent),
                const SizedBox(width: 3),
                _Dot(ctrl: _dot3, color: p.accent),
              ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot({required this.ctrl, required this.color});

  final AnimationController ctrl;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ctrl,
      builder: (_, child) => Opacity(
        opacity: 0.3 + ctrl.value * 0.7,
        child: Transform.scale(
          scale: 0.8 + ctrl.value * 0.2,
          child: Container(
            width: 4,
            height: 4,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
        ),
      ),
    );
  }
}
