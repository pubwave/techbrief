import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../model/channel_filter.dart';
import '../model/feed_article.dart';
import 'http_client_factory.dart';
import 'translation_event.dart';

class ScheduleInfo {
  const ScheduleInfo({required this.interval, this.lastSyncAt});

  final Duration interval;
  final DateTime? lastSyncAt;
}

class TechBriefApi {
  TechBriefApi(this.baseUrl, {http.Client? client})
      : _client = client ?? createHttpClient();

  final String baseUrl;
  final http.Client _client;

  // package:http has no built-in timeout, so a dead/slow socket would hang the
  // UI until the OS gives up (minutes). _requestTimeout bounds normal requests;
  // _connectTimeout bounds the headers/connect phase of SSE streams (the long-
  // lived body that follows is kept alive by the server's heartbeat pings).
  static const Duration _requestTimeout = Duration(seconds: 15);
  static const Duration _connectTimeout = Duration(seconds: 15);

  Uri _uri(String path, [Map<String, String?> params = const {}]) {
    final base = Uri.parse(baseUrl.replaceAll(RegExp(r'/+$'), ''));
    final query = <String, String>{
      for (final e in params.entries)
        if (e.value != null && e.value!.isNotEmpty) e.key: e.value!,
    };
    return base.replace(
      path: '${base.path}${path.startsWith('/') ? path : '/$path'}',
      queryParameters: query.isEmpty ? null : query,
    );
  }

  Future<ScheduleInfo> fetchScheduleInfo() async {
    try {
      final res = await _client.get(_uri('/v1/schedule')).timeout(_requestTimeout);
      _check(res);
      final json = jsonDecode(res.body) as Map<String, dynamic>;
      final minutes = json['intervalMinutes'];
      final interval = (minutes is num && minutes > 0)
          ? Duration(minutes: minutes.toInt())
          : const Duration(minutes: 15);
      final lastRaw = json['lastSyncAt'];
      final lastSyncAt = lastRaw is String ? DateTime.tryParse(lastRaw) : null;
      return ScheduleInfo(interval: interval, lastSyncAt: lastSyncAt);
    } catch (_) {
      return const ScheduleInfo(interval: Duration(minutes: 15));
    }
  }

  Future<String> fetchDefaultLanguage() async {
    final res = await _client.get(_uri('/v1/config')).timeout(_requestTimeout);
    _check(res);
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    final app = json['app'];
    if (app is Map<String, dynamic>) {
      return app['defaultLanguage'] as String? ?? 'en';
    }
    return 'en';
  }

  Future<FeedPage> fetchFeed({
    required ChannelFilter channel,
    required String language,
    required int limit,
    required int offset,
    String? since,
    String? search,
  }) async {
    final res = await _client.get(
      _uri('/v1/feed', {
        'category': channel.apiValue,
        'language': language,
        'limit': '$limit',
        'offset': '$offset',
        'since': since,
        'q': search,
      }),
    ).timeout(_requestTimeout);
    _check(res);
    return FeedPage.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Stream<void> streamFeedEvents() async* {
    try {
      final req = http.Request('GET', _uri('/v1/feed/events'));
      final res = await _client.send(req).timeout(_connectTimeout);
      if (res.statusCode != 200) {
        // Bail promptly on a non-200 so the stream ends and the controller
        // reconnects, instead of hanging on the error response body.
        throw http.ClientException('feed events HTTP ${res.statusCode}');
      }
      await for (final line in res.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())) {
        if (line.startsWith('event: feed_updated')) {
          yield null;
        }
      }
    } catch (_) {
      // Connection failed — stream ends, onDone triggers reconnect
    }
  }

  Future<FeedArticle> fetchArticle(String id, String language) async {
    final res = await _client.get(
      _uri('/v1/feed/$id', {'language': language}),
    ).timeout(_requestTimeout);
    _check(res);
    return FeedArticle.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Stream<TranslationEvent> streamTranslation(
    String id,
    String language,
  ) async* {
    final req = http.Request(
      'GET',
      _uri('/v1/feed/$id/translate/stream', {'language': language}),
    );
    final res = await _client.send(req).timeout(_connectTimeout);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Translation failed HTTP ${res.statusCode}');
    }

    String? eventName;
    final buf = StringBuffer();
    await for (final line in res.stream
        .transform(utf8.decoder)
        .transform(const LineSplitter())) {
      if (line.startsWith('event:')) {
        eventName = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        buf.writeln(line.substring(5).trim());
      } else if (line.trim().isEmpty && buf.isNotEmpty) {
        final event = _parseEvent(eventName, buf.toString().trim());
        if (event != null) yield event;
        eventName = null;
        buf.clear();
      }
    }
  }

  void dispose() => _client.close();
}

TranslationEvent? _parseEvent(String? name, String raw) {
  if (raw.isEmpty) return null;
  final data = jsonDecode(raw) as Map<String, dynamic>;
  switch (name) {
    case 'partial':
      return TranslationPartial(
        bodyNormalized: data['translatedBodyNormalized'] as String?,
        bodyTiptapJson: _map(data['translatedBodyTiptapJson']),
      );
    case 'completed':
      final a = data['article'];
      if (a is Map<String, dynamic>) {
        return TranslationCompleted(FeedArticle.fromJson(a));
      }
      return null;
    case 'failed':
      return TranslationFailed(
        data['message'] as String? ?? 'Translation unavailable.',
      );
    default:
      return null;
  }
}

void _check(http.Response res) {
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw Exception('HTTP ${res.statusCode}');
  }
}

Map<String, dynamic>? _map(Object? v) {
  if (v is Map<String, dynamic>) return v;
  if (v is Map) return Map<String, dynamic>.from(v);
  return null;
}
