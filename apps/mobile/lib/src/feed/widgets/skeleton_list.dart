import 'package:flutter/material.dart';
import '../../theme/palette.dart';

class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, required this.palette, this.count = 4});

  final AppPalette palette;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(count, (i) => _SkeletonCard(palette: palette, index: i)),
    );
  }
}

class _SkeletonCard extends StatefulWidget {
  const _SkeletonCard({required this.palette, required this.index});

  final AppPalette palette;
  final int index;

  @override
  State<_SkeletonCard> createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<_SkeletonCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _anim = Tween<double>(begin: 0.4, end: 0.9).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    Future.delayed(Duration(milliseconds: widget.index * 100), () {
      if (mounted) _ctrl.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, widget) => Opacity(
        opacity: _anim.value,
        child: _buildCard(),
      ),
    );
  }

  Widget _buildCard() {
    final p = widget.palette;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: p.surfaceCard,
        border: Border.all(color: p.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _skel(p, width: 22, height: 22, radius: 11),
              const SizedBox(width: 8),
              _skel(p, width: 100, height: 10),
              const Spacer(),
              _skel(p, width: 40, height: 10),
            ],
          ),
          const SizedBox(height: 10),
          _skel(p, width: double.infinity, height: 14),
          const SizedBox(height: 6),
          _skel(p, width: 200, height: 14),
          const SizedBox(height: 10),
          Row(
            children: [
              _skel(p, width: 64, height: 18, radius: 5),
              const SizedBox(width: 6),
              _skel(p, width: 48, height: 18, radius: 5),
              const Spacer(),
              _skel(p, width: 40, height: 10),
            ],
          ),
        ],
      ),
    );
  }
}

Widget _skel(AppPalette p, {double? width, double? height, double radius = 4}) {
  return Container(
    width: width,
    height: height,
    decoration: BoxDecoration(
      color: p.border,
      borderRadius: BorderRadius.circular(radius),
    ),
  );
}
