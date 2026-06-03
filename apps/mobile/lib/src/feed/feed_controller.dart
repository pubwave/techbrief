import 'dart:async';

import 'package:flutter/foundation.dart';

import '../api/api_client.dart';
import '../api/translation_event.dart';
import '../model/channel_filter.dart';
import '../model/feed_article.dart';
import '../storage/settings_store.dart';

const _apiBaseUrl = String.fromEnvironment('API_BASE_URL');
const _pageSize = 20;
const _maxConcurrentTranslations = 3;

class FeedController extends ChangeNotifier {
  FeedController(this._store) {
    _api = _apiBaseUrl.isNotEmpty ? TechBriefApi(_apiBaseUrl) : null;
  }

  final SettingsStore _store;
  TechBriefApi? _api;

  String _language = 'en';
  ChannelFilter _channel = ChannelFilter.all;
  String _search = '';
  String? _selectedId;
  List<FeedArticle> _items = const [];
  int _total = 0;
  bool _loading = true;
  bool _loadingMore = false;
  bool _usingCache = false;
  bool _hasError = false;
  bool _showingCached = false;
  int _newCount = 0;
  // Server feed `total` the user has already seen; _newCount = _total - _seenTotal,
  // so the badge is exact regardless of how many new articles arrive at once.
  int _seenTotal = 0;
  // Ids of articles merged into the list via the "+N New" badge that haven't
  // been opened yet, used to mark them "New" per-card. Populated on flush.
  Set<String> _newIds = {};
  // Server rows consumed from the top via pagination (the base, server-ordered
  // segment). "+N New" prepends new articles out of server order, so loadMore
  // pages by this count — not _items.length — to avoid duplicates/gaps; a
  // dedupe on append guards overlaps from the shifted server ordering.
  int _baseCount = 0;
  DateTime? _lastSyncSignalAt;
  Timer? _searchDebounce;
  final Map<String, StreamSubscription<TranslationEvent>> _translateSubs = {};
  // Ids whose translation failed or aborted. The prefetch fill skips these so a
  // persistently failing article can't spin the queue; a retry happens only when
  // the user opens it (it becomes _selectedId, which is picked regardless).
  final Set<String> _failedTranslations = {};
  StreamSubscription<void>? _eventsSub;
  // Pending feed-events reconnect; tracked so dispose() can cancel it. Without
  // this, a reconnect scheduled by onError/onDone would still fire after dispose
  // and run _connectEvents / notifyListeners on a disposed controller.
  Timer? _reconnectTimer;
  bool _disposed = false;

  // getters
  String get language => _language;
  ChannelFilter get channel => _channel;
  String get search => _search;
  String? get selectedId => _selectedId;
  List<FeedArticle> get items => _items;
  // Search is global (server-side) now, so _items already holds the filtered
  // results — no local filtering.
  List<FeedArticle> get visibleItems => _items;

  int get total => _total;
  bool get loading => _loading;
  bool get loadingMore => _loadingMore;
  bool get usingCache => _usingCache;
  bool get hasError => _hasError;
  bool get showingCached => _showingCached;
  int get newCount => _newCount;
  Set<String> get newIds => _newIds;
  bool get hasMore => _baseCount < _total;
  // Bumped on every feed_updated push from the server (a real sync). The sync
  // status bar watches this to reset its countdown.
  DateTime? get lastSyncSignalAt => _lastSyncSignalAt;

  Future<ScheduleInfo> fetchScheduleInfo() async {
    final api = _api;
    if (api == null) return const ScheduleInfo(interval: Duration(minutes: 15));
    return api.fetchScheduleInfo();
  }

  Future<void> init() async {
    await loadInitial();
    _connectEvents();
  }

  void _connectEvents() {
    if (_disposed) return;
    final api = _api;
    if (api == null) return;
    _eventsSub?.cancel();
    _eventsSub = api.streamFeedEvents().listen(
      (_) {
        _lastSyncSignalAt = DateTime.now();
        notifyListeners();
        // If we started empty (DB had no articles yet, e.g. first launch before
        // the initial sync finished), the incremental path would bail; do a full
        // load so the list populates without needing to reopen the app.
        if (_items.isEmpty) {
          loadInitial();
        } else {
          _fetchIncremental();
        }
      },
      onError: (_) => _scheduleReconnect(const Duration(seconds: 30)),
      onDone: () => _scheduleReconnect(const Duration(seconds: 5)),
    );
  }

  void _scheduleReconnect(Duration delay) {
    if (_disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, _connectEvents);
  }

  Future<void> _fetchIncremental() async {
    final api = _api;
    if (api == null || _loading || _items.isEmpty) return;
    try {
      // A push only updates the badge; the visible list is untouched until the
      // user taps "+N New". We just need the latest server total to compute the
      // exact unseen count (no window fetch / reconcile needed).
      final page = await api.fetchFeed(
        channel: _channel,
        language: _language,
        limit: _pageSize,
        offset: 0,
        search: _search,
      );
      _total = page.total;
      final delta = page.total - _seenTotal;
      _newCount = delta > 0 ? delta : 0;
      notifyListeners();
    } catch (_) {}
  }

  // Tap the "+N New" badge: fetch from the top deep enough to cover every new
  // article (above the loaded base depth) in server order, pin the ones not
  // already shown to the top, mark them "New" per-card, then clear the count.
  // _baseCount is left untouched (these are prepended, not consumed base pages),
  // so pagination stays consistent. The screen also scrolls the list to top.
  Future<void> dismissNew() async {
    if (_newCount <= 0) return;
    final api = _api;
    final current = _items;
    if (api != null) {
      try {
        final needed = _baseCount + _newCount;
        final limit = needed > _pageSize ? needed : _pageSize;
        final page = await api.fetchFeed(
          channel: _channel,
          language: _language,
          limit: limit,
          offset: 0,
          search: _search,
        );
        final have = {for (final a in current) a.id};
        final arrived =
            page.items.where((a) => !have.contains(a.id)).toList();
        if (arrived.isNotEmpty) {
          _items = [...arrived, ...current];
          _newIds = {..._newIds, for (final a in arrived) a.id};
        }
        _total = page.total;
        _seenTotal = page.total;
        unawaited(_store.saveCachedFeed(_items));
        _rebalanceQueue();
      } catch (_) {
        _seenTotal = _total;
      }
    } else {
      _seenTotal = _total;
    }
    _newCount = 0;
    notifyListeners();
  }

  // Opening an article marks it read, removing its per-card "New" marker.
  void markRead(String id) {
    if (!_newIds.contains(id)) return;
    _newIds = {..._newIds}..remove(id);
    notifyListeners();
  }

  Future<void> loadInitial() async {
    _loading = true;
    _hasError = false;
    _showingCached = false;
    _usingCache = false;
    _newCount = 0;
    _newIds = {};
    _failedTranslations.clear();
    notifyListeners();

    final api = _api;
    if (api == null) {
      await _useCacheOrError();
      return;
    }

    // First launch on iOS returns NSURLErrorDomain -1009 for the LAN address
    // when the local-network permission stack isn't ready at the instant the
    // request fires (reopening works because by then it is ready). NSURLSession
    // — unlike dart:io sockets — recovers within the same session, so retry a
    // few times: once the user has tapped Allow and the stack is up, a fresh
    // request succeeds without needing an app restart.
    const maxAttempts = 6;
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        _language = await api.fetchDefaultLanguage();
        final page = await api.fetchFeed(
          channel: _channel,
          language: _language,
          limit: _pageSize,
          offset: 0,
          search: _search,
        );
        _items = page.items;
        _total = page.total;
        _seenTotal = page.total;
        _baseCount = page.items.length;
        _loading = false;
        notifyListeners();
        await _store.saveCachedFeed(_items);
        _rebalanceQueue();
        return;
      } catch (_) {
        if (attempt < maxAttempts - 1) {
          await Future.delayed(const Duration(seconds: 2));
        }
      }
    }
    await _useCacheOrError();
  }

  Future<void> loadMore() async {
    if (_loadingMore || !hasMore) return;
    final api = _api;
    if (api == null) return;
    _loadingMore = true;
    notifyListeners();
    try {
      // Page by the base count (server rows consumed from the top), not
      // _items.length — pinned "New" articles sit out of server order and would
      // skew the offset. Dedupe on append: the server ordering shifts as
      // articles arrive, so a page can re-include something already shown.
      final page = await api.fetchFeed(
        channel: _channel,
        language: _language,
        limit: _pageSize,
        offset: _baseCount,
        search: _search,
      );
      _baseCount += page.items.length;
      final have = {for (final a in _items) a.id};
      final additions = page.items.where((a) => !have.contains(a.id)).toList();
      _items = [..._items, ...additions];
      _total = page.total;
    } catch (_) {}
    _loadingMore = false;
    notifyListeners();
    // Newly paged-in articles join the translation queue so their list cards
    // show translated titles too (the drain only advances while slots free up).
    _rebalanceQueue();
  }

  void setChannel(ChannelFilter channel) {
    if (_channel == channel) return;
    _channel = channel;
    _items = const [];
    _total = 0;
    notifyListeners();
    _cancelAllTranslations();
    loadInitial();
  }

  void setSearch(String value) {
    _search = value;
    notifyListeners();
    // Debounce, then reload globally from the server with the search term.
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 300), () {
      _cancelAllTranslations();
      loadInitial();
    });
  }

  Future<FeedArticle> loadArticleDetail(FeedArticle article) async {
    final api = _api;
    if (api == null) return article;
    try {
      final detail = await api.fetchArticle(article.id, _language);
      _replaceItem(detail);
      return detail;
    } catch (_) {
      return article;
    }
  }

  void setSelectedId(String? id) {
    if (_selectedId == id) return;
    _selectedId = id;
    _rebalanceQueue();
  }

  bool _shouldRequestTranslation(FeedArticle article) {
    if (_language == 'en') return false;
    if (article.language == _language) return false;
    return !article.hasTranslation;
  }

  List<String> _pickNextIds() {
    final result = <String>[];
    final sel = _selectedId;
    if (sel != null) {
      final article = _items.where((a) => a.id == sel).firstOrNull;
      if (article != null && _shouldRequestTranslation(article)) result.add(sel);
    }
    for (final a in _items) {
      if (result.length >= _maxConcurrentTranslations) break;
      if (a.id == sel) continue;
      if (_failedTranslations.contains(a.id)) continue;
      if (_shouldRequestTranslation(a)) result.add(a.id);
    }
    return result;
  }

  void _rebalanceQueue() {
    final nextIds = _pickNextIds().toSet();
    var changed = false;

    for (final id in _translateSubs.keys.toList()) {
      if (!nextIds.contains(id)) {
        _translateSubs[id]?.cancel();
        _translateSubs.remove(id);
        final i = _items.indexWhere((a) => a.id == id);
        if (i >= 0 && _items[i].isTranslating) {
          _items = [..._items]..[i] = _items[i].copyWith(isTranslating: false);
          changed = true;
        }
      }
    }

    for (final id in nextIds) {
      if (_translateSubs.containsKey(id)) continue;
      // Starting (or retrying) translation clears the failed flag — only the
      // selected article reaches here while failed, since the fill skips failed.
      _failedTranslations.remove(id);
      final i = _items.indexWhere((a) => a.id == id);
      if (i >= 0) {
        _items = [..._items]..[i] = _items[i].copyWith(isTranslating: true, clearTranslationError: true);
        changed = true;
      }
      _translateArticle(id);
    }

    if (changed) notifyListeners();
  }

  Future<void> _useCacheOrError() async {
    final cached = await _store.loadCachedFeed();
    final valid = cached
        .where((a) => a.displayTitle.isNotEmpty && a.sourceName.trim().isNotEmpty)
        .toList();
    _items = valid;
    _total = valid.length;
    _seenTotal = valid.length;
    _baseCount = valid.length;
    _loading = false;
    _usingCache = valid.isNotEmpty;
    _hasError = true;
    _showingCached = valid.isNotEmpty;
    notifyListeners();
  }

  Future<void> _translateArticle(String id) async {
    final api = _api;
    if (api == null) {
      _setItemState(id, (a) => a.copyWith(isTranslating: false));
      return;
    }
    await _translateSubs[id]?.cancel();
    _translateSubs[id] = api.streamTranslation(id, _language).listen(
      (event) => _onTranslationEvent(id, event),
      onError: (_) {
        _translateSubs.remove(id);
        _failedTranslations.add(id);
        _setItemState(
          id,
          (a) => a.copyWith(
            isTranslating: false,
            translationError: 'Unable to translate article.',
          ),
        );
        _rebalanceQueue();
      },
      // Stream closed without a terminal event (completed/failed already remove
      // the sub). An abnormal close — proxy/OS/server drop — leaves the sub and
      // a stuck isTranslating: true; mark it failed (so it isn't re-picked into a
      // retry loop), free the slot, and backfill the next item.
      onDone: () {
        if (_translateSubs.remove(id) != null) {
          _failedTranslations.add(id);
          _setItemState(id, (a) => a.copyWith(isTranslating: false));
          _rebalanceQueue();
        }
      },
    );
  }

  void _cancelAllTranslations() {
    for (final sub in _translateSubs.values) {
      sub.cancel();
    }
    _translateSubs.clear();
  }

  void _onTranslationEvent(String id, TranslationEvent event) {
    switch (event) {
      case TranslationPartial():
        _setItemState(
          id,
          (a) => a.copyWith(
            streamingBodyNormalized: event.bodyNormalized,
            streamingBodyTiptapJson: event.bodyTiptapJson,
            isTranslating: true,
          ),
        );
      case TranslationCompleted():
        _translateSubs.remove(id);
        _failedTranslations.remove(id);
        _replaceItem(event.article.copyWith(isTranslating: false, clearStreamingBody: true));
        _store.saveCachedFeed(_items);
        // Backfill: a freed slot lets the next untranslated item start, so the
        // whole loaded list drains (3 at a time) and list cards show translated
        // titles as the user scrolls — not just the first batch.
        _rebalanceQueue();
      case TranslationFailed():
        _translateSubs.remove(id);
        _failedTranslations.add(id);
        _setItemState(
          id,
          (a) => a.copyWith(isTranslating: false, translationError: event.message),
        );
        // Backfill the freed slot; _failedTranslations keeps this article out of
        // the fill so it won't be re-picked into a retry loop.
        _rebalanceQueue();
    }
  }

  void _replaceItem(FeedArticle next) {
    final i = _items.indexWhere((a) => a.id == next.id);
    if (i < 0) return;
    _items = [..._items]..[i] = next;
    notifyListeners();
  }

  void _setItemState(String id, FeedArticle Function(FeedArticle) update) {
    final i = _items.indexWhere((a) => a.id == id);
    if (i < 0) return;
    _items = [..._items]..[i] = update(_items[i]);
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _eventsSub?.cancel();
    _searchDebounce?.cancel();
    _cancelAllTranslations();
    _api?.dispose();
    super.dispose();
  }
}
