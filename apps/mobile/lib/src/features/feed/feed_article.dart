import 'feed_time.dart';

class FeedArticle {
  const FeedArticle({
    required this.id,
    required this.channel,
    required this.sourceName,
    required this.title,
    required this.summary,
    required this.body,
    required this.publishedAt,
    required this.originalUrl,
  });

  final String id;
  final String channel;
  final String sourceName;
  final String title;
  final String summary;
  final String body;
  final String publishedAt;
  final String originalUrl;
  static FeedArticle fromMap(Map<String, Object?> map) {
    return FeedArticle(
      id: map['id']! as String,
      channel: map['channel']! as String,
      sourceName: map['source_name']! as String,
      title: map['title']! as String,
      summary: map['summary']! as String,
      body: map['body']! as String,
      publishedAt: map['published_at']! as String,
      originalUrl: map['original_url']! as String,
    );
  }

  static FeedArticle fromRemoteJson(Map<String, Object?> json) {
    final contentType = json['contentType'] as String? ?? 'tech-news';
    final sourceName = json['sourceName'] as String? ?? 'Unknown source';
    final title = json['title'] as String? ?? 'Untitled article';
    final summary = (json['summary'] as String?)?.trim().isNotEmpty == true
        ? json['summary']! as String
        : 'No summary available yet.';
    final body = _readBody(json, fallbackSummary: summary);

    return FeedArticle(
      id: json['id']! as String,
      channel: channelLabelForContentType(contentType),
      sourceName: sourceName,
      title: title,
      summary: summary,
      body: body,
      publishedAt:
          json['publishedAt'] as String? ??
          DateTime.now().toUtc().toIso8601String(),
      originalUrl: json['originalUrl'] as String? ?? '',
    );
  }

  Map<String, Object?> toMap() {
    return <String, Object?>{
      'id': id,
      'channel': channel,
      'source_name': sourceName,
      'title': title,
      'summary': summary,
      'body': body,
      'published_at': publishedAt,
      'original_url': originalUrl,
    };
  }

  static String _readBody(
    Map<String, Object?> json, {
    required String fallbackSummary,
  }) {
    final normalized = json['bodyNormalized'] as String?;
    if (normalized != null && normalized.trim().isNotEmpty) {
      return normalized.trim();
    }

    final raw = json['bodyRaw'] as String?;
    if (raw != null && raw.trim().isNotEmpty) {
      return raw.trim();
    }

    return fallbackSummary;
  }
}
