import 'dart:convert';

class FeedArticle {
  const FeedArticle({
    required this.id,
    required this.sourceId,
    required this.sourceName,
    required this.contentType,
    required this.title,
    required this.publishedAt,
    required this.originalUrl,
    this.sourceUrl,
    this.translatedTitle,
    this.summary,
    this.translatedSummary,
    this.author,
    this.tags = const <String>[],
    this.language = 'en',
    this.bodyNormalized,
    this.bodyTiptapJson,
    this.translatedBodyNormalized,
    this.translatedBodyTiptapJson,
    this.streamingBodyNormalized,
    this.streamingBodyTiptapJson,
    this.isTranslating = false,
    this.translationError,
  });

  final String id;
  final String sourceId;
  final String sourceName;
  final String contentType;
  final String title;
  final String? translatedTitle;
  final String? summary;
  final String? translatedSummary;
  final String? author;
  final String publishedAt;
  final String originalUrl;
  final String? sourceUrl;
  final List<String> tags;
  final String language;
  final String? bodyNormalized;
  final Map<String, dynamic>? bodyTiptapJson;
  final String? translatedBodyNormalized;
  final Map<String, dynamic>? translatedBodyTiptapJson;
  final String? streamingBodyNormalized;
  final Map<String, dynamic>? streamingBodyTiptapJson;
  final bool isTranslating;
  final String? translationError;

  String get displayTitle => _first([translatedTitle, title]);

  String get displaySummary =>
      _first([translatedSummary, summary, bodyNormalized]);

  String get displayBody => _first([
    streamingBodyNormalized,
    translatedBodyNormalized,
    bodyNormalized,
    translatedSummary,
    summary,
  ]);

  Map<String, dynamic>? get displayTiptapJson =>
      streamingBodyTiptapJson ?? translatedBodyTiptapJson ?? bodyTiptapJson;

  String get channelLabel =>
      contentType == 'indie-dev' ? 'Indie Dev' : 'Tech News';

  bool get hasTranslation =>
      translatedBodyTiptapJson != null || translatedBodyNormalized != null;

  int get readMinutes {
    // Language-aware: CJK scripts have no word spacing, so count them by
    // character (~400/min); Latin text by word (~220/min). Mixed content sums.
    final cjk = RegExp(r'[一-鿿㐀-䶿぀-ゟ゠-ヿ가-힣]');
    final text = displayBody;
    final cjkChars = cjk.allMatches(text).length;
    final latinWords = text
        .replaceAll(cjk, ' ')
        .trim()
        .split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .length;
    final minutes = (cjkChars / 400 + latinWords / 220).round();
    return minutes.clamp(1, 99);
  }

  DateTime get publishedDateTime {
    try {
      return DateTime.parse(publishedAt);
    } catch (_) {
      return DateTime.now();
    }
  }

  FeedArticle copyWith({
    String? translatedTitle,
    String? translatedSummary,
    String? translatedBodyNormalized,
    Map<String, dynamic>? translatedBodyTiptapJson,
    String? streamingBodyNormalized,
    Map<String, dynamic>? streamingBodyTiptapJson,
    bool? isTranslating,
    String? translationError,
    bool clearStreamingBody = false,
    bool clearTranslationError = false,
  }) => FeedArticle(
    id: id,
    sourceId: sourceId,
    sourceName: sourceName,
    contentType: contentType,
    title: title,
    translatedTitle: translatedTitle ?? this.translatedTitle,
    summary: summary,
    translatedSummary: translatedSummary ?? this.translatedSummary,
    author: author,
    publishedAt: publishedAt,
    originalUrl: originalUrl,
    sourceUrl: sourceUrl,
    tags: tags,
    language: language,
    bodyNormalized: bodyNormalized,
    bodyTiptapJson: bodyTiptapJson,
    translatedBodyNormalized:
        translatedBodyNormalized ?? this.translatedBodyNormalized,
    translatedBodyTiptapJson:
        translatedBodyTiptapJson ?? this.translatedBodyTiptapJson,
    streamingBodyNormalized: clearStreamingBody
        ? null
        : (streamingBodyNormalized ?? this.streamingBodyNormalized),
    streamingBodyTiptapJson: clearStreamingBody
        ? null
        : (streamingBodyTiptapJson ?? this.streamingBodyTiptapJson),
    isTranslating: isTranslating ?? this.isTranslating,
    translationError: clearTranslationError
        ? null
        : (translationError ?? this.translationError),
  );

  static FeedArticle fromJson(Map<String, dynamic> json) => FeedArticle(
    id: json['id'] as String? ?? '',
    sourceId: json['sourceId'] as String? ?? '',
    sourceName: json['sourceName'] as String? ?? 'Unknown',
    contentType: json['contentType'] as String? ?? 'tech-news',
    title: json['title'] as String? ?? 'Untitled',
    translatedTitle: json['translatedTitle'] as String?,
    summary: json['summary'] as String?,
    translatedSummary: json['translatedSummary'] as String?,
    author: json['author'] as String?,
    publishedAt:
        json['publishedAt'] as String? ?? DateTime.now().toIso8601String(),
    originalUrl: json['originalUrl'] as String? ?? '',
    sourceUrl: json['sourceUrl'] as String?,
    tags: (json['tags'] as List<dynamic>? ?? const <dynamic>[])
        .map((t) => t.toString())
        .toList(),
    language: json['language'] as String? ?? 'en',
    bodyNormalized: json['bodyNormalized'] as String?,
    bodyTiptapJson: _map(json['bodyTiptapJson']),
    translatedBodyNormalized: json['translatedBodyNormalized'] as String?,
    translatedBodyTiptapJson: _map(json['translatedBodyTiptapJson']),
  );

  Map<String, dynamic> toCacheJson() => <String, dynamic>{
    'id': id,
    'sourceId': sourceId,
    'sourceName': sourceName,
    'contentType': contentType,
    'title': title,
    'translatedTitle': translatedTitle,
    'summary': summary,
    'translatedSummary': translatedSummary,
    'author': author,
    'publishedAt': publishedAt,
    'originalUrl': originalUrl,
    'sourceUrl': sourceUrl,
    'tags': tags,
    'language': language,
    'bodyNormalized': bodyNormalized,
    'bodyTiptapJson': bodyTiptapJson,
    'translatedBodyNormalized': translatedBodyNormalized,
    'translatedBodyTiptapJson': translatedBodyTiptapJson,
  };
}

class FeedPage {
  const FeedPage({required this.items, required this.total});

  final List<FeedArticle> items;
  final int total;

  static FeedPage fromJson(Map<String, dynamic> json) {
    final items = (json['items'] as List<dynamic>? ?? const <dynamic>[])
        .whereType<Map<String, dynamic>>()
        .map(FeedArticle.fromJson)
        .toList();
    return FeedPage(items: items, total: json['total'] as int? ?? items.length);
  }
}

Map<String, dynamic> fallbackTiptapDoc(String body) {
  final paragraphs = body
      .split(RegExp(r'\n{2,}'))
      .map((p) => p.trim())
      .where((p) => p.isNotEmpty)
      .map(
        (p) => <String, dynamic>{
          'type': 'paragraph',
          'content': <Map<String, dynamic>>[
            <String, dynamic>{'type': 'text', 'text': p},
          ],
        },
      )
      .toList();
  return <String, dynamic>{
    'type': 'doc',
    'content': paragraphs.isEmpty ? const <Map<String, dynamic>>[] : paragraphs,
  };
}

String encodeArticles(List<FeedArticle> articles) =>
    jsonEncode(articles.map((a) => a.toCacheJson()).toList());

List<FeedArticle> decodeArticles(String? raw) {
  if (raw == null || raw.isEmpty) return const <FeedArticle>[];
  try {
    return (jsonDecode(raw) as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(FeedArticle.fromJson)
        .toList();
  } catch (_) {
    return const <FeedArticle>[];
  }
}

Map<String, dynamic>? _map(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

String _first(List<String?> values) {
  for (final v in values) {
    if (v != null && v.trim().isNotEmpty) return v.trim();
  }
  return '';
}
