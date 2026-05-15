import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../i18n/index.dart';
import '../../theme/app_theme.dart';
import 'feed_article.dart';
import 'feed_repository.dart';
import 'feed_time.dart';
import 'widgets/feed_bottom_tabs.dart';
import 'widgets/mobile_shell.dart';
import 'widgets/tag_chip.dart';

class FeedDetailPage extends StatelessWidget {
  const FeedDetailPage({
    super.key,
    required this.articleId,
    required this.strings,
  });

  final String articleId;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<FeedArticle?>(
      future: FeedRepository.instance.loadArticle(articleId),
      builder: (context, snapshot) {
        final article = snapshot.data;
        if (article == null) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final colors = Theme.of(context).extension<TechBriefColors>()!;
        final paragraphs = article.body.split('\n\n');

        return Scaffold(
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[colors.background, colors.backgroundAlt],
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
                child: MobileShell(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Text(
                          strings.backToFeed,
                          style: Theme.of(context).textTheme.labelSmall
                              ?.copyWith(color: colors.accent),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        article.title,
                        style: Theme.of(
                          context,
                        ).textTheme.headlineMedium?.copyWith(fontSize: 28),
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
                      const SizedBox(height: 12),
                      Text(
                        formatFeedTimestamp(article.publishedAt, strings),
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                      const SizedBox(height: 18),
                      Expanded(
                        child: ListView.separated(
                          itemCount: paragraphs.length + 1,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 18),
                          itemBuilder: (context, index) {
                            if (index == paragraphs.length) {
                              return Align(
                                alignment: Alignment.centerLeft,
                                child: _SourceButton(
                                  label: strings.openSourceLink,
                                  onPressed: () => _openSourceLink(
                                    context,
                                    strings,
                                    article.originalUrl,
                                  ),
                                ),
                              );
                            }

                            return Text(
                              paragraphs[index],
                              style: Theme.of(context).textTheme.bodyLarge,
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      FeedBottomTabs(
                        currentIndex: 0,
                        labels: <String>[
                          strings.menuFeed,
                          strings.menuSettings,
                        ],
                        onChanged: _noopTab,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  static void _noopTab(int _) {}

  static Future<void> _openSourceLink(
    BuildContext context,
    AppStrings strings,
    String originalUrl,
  ) async {
    if (originalUrl.isEmpty) {
      return;
    }

    final uri = Uri.tryParse(originalUrl);
    if (uri == null ||
        !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (!context.mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(strings.unableToOpenSourceLink)));
    }
  }
}

class _SourceButton extends StatelessWidget {
  const _SourceButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: onPressed,
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: colors.surfaceCardAlt,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: colors.border),
        ),
        child: Text(label, style: Theme.of(context).textTheme.labelLarge),
      ),
    );
  }
}
