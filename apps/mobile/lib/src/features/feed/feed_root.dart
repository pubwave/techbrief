import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../i18n/index.dart';
import '../../theme/app_theme.dart';
import 'feed_article.dart';
import 'feed_app_config_client.dart';
import 'feed_detail_page.dart';
import 'feed_repository.dart';
import 'feed_settings.dart';
import 'feed_settings_page.dart';
import 'feed_settings_repository.dart';
import 'widgets/article_card.dart';
import 'widgets/channel_switch.dart';
import 'widgets/count_chip.dart';
import 'widgets/feed_bottom_tabs.dart';
import 'widgets/mobile_shell.dart';

class FeedRoot extends StatefulWidget {
  const FeedRoot({super.key, required this.onThemeChanged});

  final ValueChanged<AppThemeId> onThemeChanged;

  @override
  State<FeedRoot> createState() => _FeedRootState();
}

class _FeedRootState extends State<FeedRoot> {
  int _currentTab = 0;
  int _channelIndex = 0;
  String _query = '';
  Future<List<FeedArticle>>? _articlesFuture;
  FeedSettings? _settings;
  AppStrings _strings = resolveAppStrings('en');
  String _appLanguage = 'en';
  bool _isSyncing = false;
  String? _statusMessage;

  @override
  void initState() {
    super.initState();
    _articlesFuture = FeedRepository.instance.loadArticles();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final settings = await FeedSettingsRepository.instance.loadSettings();
    if (!mounted) {
      return;
    }

    setState(() {
      _settings = settings;
    });

    widget.onThemeChanged(settings.themeId);
    await _refreshLanguage(settings.apiBaseUrl);
    await _syncNow(showSuccessMessage: false);
  }

  Future<void> _saveSettings(FeedSettings settings) async {
    await FeedSettingsRepository.instance.saveSettings(settings);
    if (!mounted) {
      return;
    }

    setState(() {
      _settings = settings;
    });

    widget.onThemeChanged(settings.themeId);
    await _refreshLanguage(settings.apiBaseUrl);
    if (!mounted) {
      return;
    }

    setState(() {
      _statusMessage = _strings.savedServerAddress;
    });

    await _syncNow();
  }

  Future<void> _selectTheme(AppThemeId themeId) async {
    final settings = _settings;
    if (settings == null) {
      return;
    }

    final nextSettings = settings.copyWith(themeId: themeId);
    await FeedSettingsRepository.instance.saveSettings(nextSettings);
    if (!mounted) {
      return;
    }

    setState(() {
      _settings = nextSettings;
    });
    widget.onThemeChanged(themeId);
  }

  Future<void> _refreshLanguage(String apiBaseUrl) async {
    try {
      final language = await FeedAppConfigClient(
        apiBaseUrl,
      ).fetchDefaultLanguage();
      if (!mounted) {
        return;
      }

      setState(() {
        _appLanguage = language;
        _strings = resolveAppStrings(language);
      });
    } catch (_) {
      if (!mounted) {
        return;
      }

      setState(() {
        _appLanguage = 'en';
        _strings = resolveAppStrings('en');
      });
    }
  }

  Future<void> _syncNow({bool showSuccessMessage = true}) async {
    final settings = _settings;
    if (settings == null || _isSyncing) {
      return;
    }

    setState(() {
      _isSyncing = true;
      _statusMessage = showSuccessMessage
          ? _strings.syncingLatestArticles
          : _statusMessage;
    });

    final result = await FeedRepository.instance.syncFromServer(
      settings.apiBaseUrl,
      _appLanguage,
    );
    if (!mounted) {
      return;
    }

    setState(() {
      _isSyncing = false;
      _articlesFuture = FeedRepository.instance.loadArticles();
      _statusMessage = result.errorMessage == null
          ? _strings.syncedArticles(result.savedArticles, settings.apiBaseUrl)
          : _strings.usingLocalCache(result.errorMessage!);
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

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
                  Expanded(
                    child: _currentTab == 0
                        ? _FeedTab(
                            articlesFuture: _articlesFuture!,
                            channelIndex: _channelIndex,
                            query: _query,
                            strings: _strings,
                            onChannelChanged: (value) =>
                                setState(() => _channelIndex = value),
                            onQueryChanged: (value) =>
                                setState(() => _query = value),
                          )
                        : FeedSettingsPage(
                            initialSettings:
                                _settings ??
                                const FeedSettings(
                                  apiBaseUrl: 'http://127.0.0.1:4310',
                                  themeId: AppThemeId.currentTheme,
                                ),
                            currentTheme:
                                _settings?.themeId ?? AppThemeId.currentTheme,
                            isSyncing: _isSyncing,
                            onThemeSelected: _selectTheme,
                            statusMessage: _statusMessage,
                            onSave: _saveSettings,
                            onSync: _syncNow,
                            strings: _strings,
                          ),
                  ),
                  const SizedBox(height: 12),
                  FeedBottomTabs(
                    currentIndex: _currentTab,
                    labels: <String>[_strings.menuFeed, _strings.menuSettings],
                    onChanged: (value) => setState(() => _currentTab = value),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FeedTab extends StatelessWidget {
  const _FeedTab({
    required this.articlesFuture,
    required this.channelIndex,
    required this.query,
    required this.strings,
    required this.onChannelChanged,
    required this.onQueryChanged,
  });

  final Future<List<FeedArticle>> articlesFuture;
  final int channelIndex;
  final String query;
  final AppStrings strings;
  final ValueChanged<int> onChannelChanged;
  final ValueChanged<String> onQueryChanged;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<FeedArticle>>(
      future: articlesFuture,
      builder: (context, snapshot) {
        final items = _filterArticles(snapshot.data ?? const <FeedArticle>[]);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: Theme.of(
                        context,
                      ).extension<TechBriefColors>()!.border,
                    ),
                  ),
                  padding: const EdgeInsets.all(5),
                  child: SvgPicture.asset(
                    'assets/icons/tech-brief-app-icon.svg',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'TechBrief',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      Text(
                        strings.signalReader,
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                    ],
                  ),
                ),
                CountChip(count: items.length, strings: strings),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              onChanged: onQueryChanged,
              decoration: InputDecoration(
                hintText: strings.searchPlaceholder,
                suffixText: '/',
              ),
            ),
            const SizedBox(height: 12),
            ChannelSwitch(
              labels: <String>[strings.techNewsFilter, strings.indieDevFilter],
              selectedIndex: channelIndex,
              onSelected: onChannelChanged,
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.separated(
                itemCount: items.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final article = items[index];
                  return ArticleCard(
                    article: article,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => FeedDetailPage(
                            articleId: article.id,
                            strings: strings,
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  List<FeedArticle> _filterArticles(List<FeedArticle> items) {
    final filteredByChannel = items.where(
      (article) => channelIndex == 0
          ? article.channel == 'Companies + Media'
          : article.channel == 'Indie Developers',
    );

    final keyword = query.trim().toLowerCase();
    if (keyword.isEmpty) {
      return filteredByChannel.toList();
    }

    return filteredByChannel.where((article) {
      return article.title.toLowerCase().contains(keyword) ||
          article.sourceName.toLowerCase().contains(keyword);
    }).toList();
  }
}
