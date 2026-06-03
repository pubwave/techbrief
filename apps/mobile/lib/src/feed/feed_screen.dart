import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../i18n/app_strings.dart';
import '../model/channel_filter.dart';
import '../model/feed_article.dart';
import '../theme/palette.dart';
import 'feed_controller.dart';
import 'widgets/article_card.dart';
import 'widgets/channel_tabs.dart';
import 'widgets/skeleton_list.dart';
import 'widgets/sync_status_bar.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({
    super.key,
    required this.controller,
    required this.palette,
    required this.onArticleTap,
    this.selectedId,
  });

  final FeedController controller;
  final AppPalette palette;
  final void Function(FeedArticle) onArticleTap;
  final String? selectedId;

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final _scroll = ScrollController();
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    _searchCtrl.addListener(() {
      widget.controller.setSearch(_searchCtrl.text);
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scroll.hasClients) return;
    final remaining = _scroll.position.maxScrollExtent - _scroll.position.pixels;
    if (remaining < 250) widget.controller.loadMore();
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final p = widget.palette;

    return ListenableBuilder(
      listenable: widget.controller,
      builder: (context, _) {
        final ctrl = widget.controller;
        final channelLabels = <ChannelFilter, String>{
          ChannelFilter.all: s.channelAll,
          ChannelFilter.techNews: s.channelTechNews,
          ChannelFilter.indieDev: s.channelIndieDev,
        };

        return Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  SvgPicture.asset(
                    'assets/icons/tech-brief-app-icon.svg',
                    width: 34,
                    height: 34,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.appName,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: p.text,
                            height: 1.2,
                          ),
                        ),
                        Text(
                          s.signalReader,
                          style: TextStyle(
                            fontSize: 10,
                            color: p.textMuted,
                            letterSpacing: 0.04,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!ctrl.loading && ctrl.items.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: p.accent,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${ctrl.total}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: p.accentInk,
                        ),
                      ),
                    ),
                  if (ctrl.newCount > 0) ...[
                    const SizedBox(width: 6),
                    _NewBadge(
                      count: ctrl.newCount,
                      palette: p,
                      onTap: () {
                        if (_scroll.hasClients) {
                          _scroll.animateTo(
                            0,
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOut,
                          );
                        }
                        ctrl.dismissNew();
                      },
                    ),
                  ],
                ],
              ),
            ),

            // Channel tabs (above the search box)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: ChannelTabs(
                palette: p,
                selected: ctrl.channel,
                onChanged: ctrl.setChannel,
                labels: channelLabels,
              ),
            ),

            // Search
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Container(
                decoration: BoxDecoration(
                  color: p.surfaceInput,
                  border: Border.all(color: p.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: _searchCtrl,
                  style: TextStyle(fontSize: 13, color: p.text),
                  decoration: InputDecoration(
                    hintText: s.searchPlaceholder,
                    hintStyle: TextStyle(color: p.textMuted, fontSize: 13),
                    prefixIcon: Icon(Icons.search, size: 18, color: p.textMuted),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                  ),
                ),
              ),
            ),

            // Sync status bar (below the search box). Hidden when showing cached
            // data (API unreachable): there is no live connection to sync against,
            // so the countdown/“syncing” text would be misleading. Not mounting it
            // also stops its ticker and schedule fetch.
            if (!ctrl.usingCache) SyncStatusBar(controller: ctrl, palette: p),

            // Notice / error banner
            if (ctrl.hasError || ctrl.showingCached)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: p.accentSoft,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    ctrl.showingCached ? s.showingCached : s.loadFeedError,
                    style: TextStyle(fontSize: 12, color: p.accent),
                  ),
                ),
              ),

            // Content
            Expanded(
              child: ctrl.loading ? _buildSkeleton(p) : _buildList(ctrl, p, s),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSkeleton(AppPalette p) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      child: SkeletonList(palette: p),
    );
  }

  Widget _buildList(FeedController ctrl, AppPalette p, AppStrings s) {
    final items = ctrl.visibleItems;
    if (items.isEmpty && !ctrl.loading) {
      return ListView(
        controller: _scroll,
        children: [
          SizedBox(
            height: 200,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.article_outlined, size: 40, color: p.textMuted),
                  const SizedBox(height: 12),
                  Text(
                    ctrl.search.isNotEmpty
                        ? 'No results for "${ctrl.search}"'
                        : s.emptyFeed,
                    style: TextStyle(color: p.textMuted, fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      controller: _scroll,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      itemCount: items.length + (ctrl.loadingMore ? 1 : 0),
      itemBuilder: (_, i) {
        if (i == items.length) {
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: p.accent,
                ),
              ),
            ),
          );
        }
        return ArticleCard(
          article: items[i],
          palette: p,
          onTap: () => widget.onArticleTap(items[i]),
          isSelected: items[i].id == widget.selectedId,
          isNew: ctrl.newIds.contains(items[i].id),
        );
      },
    );
  }
}

class _NewBadge extends StatefulWidget {
  const _NewBadge({required this.count, required this.palette, this.onTap});
  final int count;
  final AppPalette palette;
  final VoidCallback? onTap;

  @override
  State<_NewBadge> createState() => _NewBadgeState();
}

class _NewBadgeState extends State<_NewBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _opacity = Tween(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.palette;
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
      animation: _opacity,
      builder: (_, child) => Opacity(opacity: _opacity.value, child: child),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: p.accent.withValues(alpha: 0.15),
          border: Border.all(color: p.accent, width: 1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          '+${widget.count} New',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: p.accent,
            letterSpacing: 0.04,
          ),
        ),
      ),
      ),
    );
  }
}
