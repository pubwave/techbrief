import 'package:flutter/material.dart';
import '../../i18n/app_strings.dart';
import '../../model/feed_article.dart';
import '../../theme/palette.dart';
import '../../widgets/source_avatar.dart';
import '../../widgets/tag_chip.dart';

class ArticleCard extends StatelessWidget {
  const ArticleCard({
    super.key,
    required this.article,
    required this.palette,
    required this.onTap,
    this.isSelected = false,
    this.isNew = false,
  });

  final FeedArticle article;
  final AppPalette palette;
  final VoidCallback onTap;
  final bool isSelected;
  final bool isNew;

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final p = palette;

    const radius = 14.0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        // Uniform border keeps the rounded corners (a non-uniform Border voids
        // borderRadius in Flutter). The selected-state accent is painted as an
        // L-shaped stroke (left edge + top-left + bottom-left corners) overlaid
        // on top, so the bar and both left corners read as one continuous edge.
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: p.surfaceCard,
          border: Border.all(color: p.border),
          borderRadius: BorderRadius.circular(radius),
        ),
        foregroundDecoration: isSelected
            ? _LeftAccentDecoration(color: p.accent, radius: radius)
            : null,
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (isSelected) const SizedBox(width: 3),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(13),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
            Row(
              children: [
                SourceAvatar(sourceName: article.sourceName),
                const SizedBox(width: 7),
                Expanded(
                  child: Text(
                    article.sourceName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: p.textSecondary,
                    ),
                  ),
                ),
                if (isNew) ...[
                  const SizedBox(width: 6),
                  _NewChip(palette: p),
                ],
                const SizedBox(width: 6),
                Text(
                  '⏱ ${s.relativeTime(article.publishedDateTime)}',
                  style: TextStyle(fontSize: 11, color: p.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              article.displayTitle,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: p.text,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ChannelTagChip(
                  label: article.channelLabel,
                  palette: p,
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: SourceTagChip(
                    label: article.sourceName,
                    sourceName: article.sourceName,
                  ),
                ),
                const Spacer(),
                Text(
                  '📖 ${s.readTime(article.readMinutes)}',
                  style: TextStyle(fontSize: 11, color: p.textMuted),
                ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
  }
}

/// Selected-state accent: a 3px stroke tracing the card's left edge together
/// with its top-left and bottom-left rounded corners, so the bar and corners
/// form one continuous highlight.
class _LeftAccentDecoration extends Decoration {
  const _LeftAccentDecoration({required this.color, required this.radius});

  final Color color;
  final double radius;

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) =>
      _LeftAccentPainter(color: color, radius: radius);
}

class _LeftAccentPainter extends BoxPainter {
  _LeftAccentPainter({required this.color, required this.radius});

  final Color color;
  final double radius;

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration config) {
    final size = config.size!;
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..isAntiAlias = true;
    final inset = paint.strokeWidth / 2;
    final r = radius - inset;
    final left = offset.dx + inset;
    final top = offset.dy + inset;
    final bottom = offset.dy + size.height - inset;
    final path = Path()
      ..moveTo(offset.dx + radius, top)
      ..arcToPoint(Offset(left, offset.dy + radius),
          radius: Radius.circular(r), clockwise: false)
      ..lineTo(left, offset.dy + size.height - radius)
      ..arcToPoint(Offset(offset.dx + radius, bottom),
          radius: Radius.circular(r), clockwise: false);
    canvas.drawPath(path, paint);
  }
}

/// A small pulsing "New" marker for freshly synced articles.
class _NewChip extends StatefulWidget {
  const _NewChip({required this.palette});

  final AppPalette palette;

  @override
  State<_NewChip> createState() => _NewChipState();
}

class _NewChipState extends State<_NewChip> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1000),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.palette;
    return FadeTransition(
      opacity: Tween<double>(begin: 1, end: 0.45).animate(_controller),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 1),
        decoration: BoxDecoration(
          color: p.accent,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          'New',
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w700,
            color: p.accentInk,
          ),
        ),
      ),
    );
  }
}
