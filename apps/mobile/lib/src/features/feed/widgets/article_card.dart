import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';
import '../feed_article.dart';
import 'tag_chip.dart';

class ArticleCard extends StatelessWidget {
  const ArticleCard({super.key, required this.article, required this.onTap});

  final FeedArticle article;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: colors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: colors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              '${article.channel} · ${article.sourceName}',
              style: Theme.of(
                context,
              ).textTheme.labelSmall?.copyWith(color: colors.accent),
            ),
            const SizedBox(height: 10),
            Text(
              article.title,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontSize: 18),
            ),
            const SizedBox(height: 10),
            Text(
              article.summary,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                TagChip(label: article.channel),
                TagChip(label: article.sourceName, accent: true),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
