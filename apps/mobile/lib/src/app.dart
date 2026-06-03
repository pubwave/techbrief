import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'api/api_client.dart';
import 'detail/detail_screen.dart';
import 'feed/feed_controller.dart';
import 'feed/feed_screen.dart';
import 'model/feed_article.dart';
import 'settings/settings_screen.dart';
import 'storage/settings_store.dart';
import 'theme/palette.dart';
import 'theme/theme_builder.dart';
import 'i18n/app_strings.dart';
import 'widgets/bottom_tab.dart';

class TechBriefApp extends StatefulWidget {
  const TechBriefApp({super.key, required this.store});

  final SettingsStore store;

  @override
  State<TechBriefApp> createState() => _TechBriefAppState();
}

const _apiBaseUrl = String.fromEnvironment('API_BASE_URL');

class _TechBriefAppState extends State<TechBriefApp> {
  AppThemeId _themeId = AppThemeId.current;
  // UI language. Driven by the configured defaultLanguage (NOT the device
  // locale) so the app chrome matches the chosen language. Null until known →
  // falls back to the device locale.
  Locale? _locale;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final theme = await widget.store.loadTheme();
    final cachedLanguage = await widget.store.loadLanguage();
    if (mounted) {
      setState(() {
        _themeId = theme;
        _locale = _localeFromLanguage(cachedLanguage);
        _ready = true;
      });
    }
    await _refreshLanguageFromServer();
  }

  Future<void> _refreshLanguageFromServer() async {
    if (_apiBaseUrl.isEmpty) return;
    // Mirrors the feed retry: the first request after launch can fail with
    // NSURLErrorDomain -1009 while the iOS local-network stack comes up. Each
    // attempt uses a fresh client, so once the permission is effective the UI
    // language switches to the configured one instead of staying on the device
    // locale fallback.
    for (var attempt = 0; attempt < 6; attempt++) {
      try {
        final language = await TechBriefApi(_apiBaseUrl)
            .fetchDefaultLanguage()
            .timeout(const Duration(seconds: 10));
        await widget.store.saveLanguage(language);
        if (mounted) {
          setState(() => _locale = _localeFromLanguage(language));
        }
        return;
      } catch (_) {
        // Keep the cached/device locale and retry shortly.
      }
      if (!mounted) return;
      await Future.delayed(const Duration(seconds: 2));
    }
  }

  Locale? _localeFromLanguage(String? language) {
    if (language == null || language.isEmpty) return null;
    final parts = language.split(RegExp(r'[-_]'));
    final code = parts.first.toLowerCase();
    if (parts.length >= 2 && parts[1].isNotEmpty) {
      return Locale(code, parts[1].toUpperCase());
    }
    return Locale(code);
  }

  void _setTheme(AppThemeId id) {
    setState(() => _themeId = id);
    widget.store.saveTheme(id);
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) return const SizedBox.shrink();

    return MaterialApp(
      title: 'TechBrief',
      debugShowCheckedModeBanner: false,
      theme: buildMaterialTheme(_themeId),
      locale: _locale,
      localizationsDelegates: const [
        _AppStringsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('zh', 'CN'),
        Locale('zh', 'TW'),
        Locale('ja'),
        Locale('ko'),
        Locale('es'),
        Locale('fr'),
        Locale('de'),
        Locale('pt'),
      ],
      home: _HomeRoot(
        themeId: _themeId,
        store: widget.store,
        onThemeChanged: _setTheme,
      ),
    );
  }
}


class _HomeRoot extends StatefulWidget {
  const _HomeRoot({
    required this.themeId,
    required this.store,
    required this.onThemeChanged,
  });

  final AppThemeId themeId;
  final SettingsStore store;
  final ValueChanged<AppThemeId> onThemeChanged;

  @override
  State<_HomeRoot> createState() => _HomeRootState();
}

class _HomeRootState extends State<_HomeRoot> {
  late FeedController _feedCtrl;
  int _tabIndex = 0;
  String? _selectedId;
  // Guards the tap -> (async detail load) -> push window so rapid taps can't
  // each open their own detail page. Released once the detail is loaded, so
  // in-detail prev/next navigation is unaffected.
  bool _openingArticle = false;

  AppPalette get _palette => widget.themeId.palette;

  @override
  void initState() {
    super.initState();
    _feedCtrl = FeedController(widget.store);
    _feedCtrl.init();
  }

  @override
  void dispose() {
    _feedCtrl.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(_HomeRoot old) {
    super.didUpdateWidget(old);
    // Palette changes are passed through to children, no controller rebuild needed.
  }

  Future<void> _openArticle(FeedArticle article) async {
    if (_openingArticle) return;
    _openingArticle = true;
    // Reading an article clears its per-card "New" marker.
    _feedCtrl.markRead(article.id);
    setState(() => _selectedId = article.id);
    final p = _palette;
    final FeedArticle detail;
    try {
      detail = await _feedCtrl.loadArticleDetail(article);
    } finally {
      // Release before pushing: the navigation push below is synchronous to
      // start, so no second tap can slip in.
      _openingArticle = false;
    }
    if (!mounted) return;
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => DetailScreen(
          article: detail,
          palette: p,
          feedController: _feedCtrl,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = _palette;
    final s = AppStrings.of(context);

    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarBrightness: p.isDark ? Brightness.dark : Brightness.light,
    ));

    return Scaffold(
      backgroundColor: p.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: _tabIndex == 0
                  ? FeedScreen(
                      controller: _feedCtrl,
                      palette: p,
                      selectedId: _selectedId,
                      onArticleTap: _openArticle,
                    )
                  : SettingsScreen(
                      palette: p,
                      selectedTheme: widget.themeId,
                      onThemeChanged: widget.onThemeChanged,
                    ),
            ),
            AppBottomTab(
              palette: p,
              index: _tabIndex,
              onChanged: (i) => setState(() => _tabIndex = i),
              labels: [s.tabFeed, s.tabSettings],
              icons: [Icons.article_outlined, Icons.settings_outlined],
            ),
          ],
        ),
      ),
    );
  }
}

// Minimal localizations delegate so AppStrings.of() resolves correctly.
class _AppStringsDelegate
    extends LocalizationsDelegate<_AppStringsMarker> {
  const _AppStringsDelegate();

  @override
  bool isSupported(Locale locale) => true;

  @override
  Future<_AppStringsMarker> load(Locale locale) async =>
      _AppStringsMarker(locale);

  @override
  bool shouldReload(_AppStringsDelegate old) => false;
}

class _AppStringsMarker {
  const _AppStringsMarker(this.locale);

  final Locale locale;
}
