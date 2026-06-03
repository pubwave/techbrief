import 'package:flutter/material.dart';
import '../../i18n/app_strings.dart';
import '../../model/feed_article.dart';
import '../../theme/palette.dart';
import '../../widgets/source_avatar.dart';

class DetailToolbar extends StatelessWidget {
  const DetailToolbar({
    super.key,
    required this.article,
    required this.palette,
    required this.onBack,
    required this.onOpenExternal,
  });

  final FeedArticle article;
  final AppPalette palette;
  final VoidCallback onBack;
  final VoidCallback onOpenExternal;

  @override
  Widget build(BuildContext context) {
    final p = palette;
    final s = AppStrings.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: p.border)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: onBack,
            child: Text(
              '‹',
              style: TextStyle(
                fontSize: 26,
                color: p.accent,
                height: 1,
              ),
            ),
          ),
          const SizedBox(width: 6),
          SourceAvatar(sourceName: article.sourceName, size: 20, fontSize: 8),
          const SizedBox(width: 5),
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
          Text(' · ', style: TextStyle(color: p.borderStrong, fontSize: 12)),
          Text(
            '⏱ ${AppStrings.of(context).relativeTime(article.publishedDateTime)}',
            style: TextStyle(fontSize: 12, color: p.textMuted),
          ),
          Text(' · ', style: TextStyle(color: p.borderStrong, fontSize: 12)),
          Text(
            '📖 ${s.readTime(article.readMinutes)}',
            style: TextStyle(fontSize: 12, color: p.textMuted),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onOpenExternal,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                border: Border.all(color: p.borderStrong),
                borderRadius: BorderRadius.circular(7),
              ),
              alignment: Alignment.center,
              child: Text(
                '↗',
                style: TextStyle(fontSize: 13, color: p.textMuted),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
