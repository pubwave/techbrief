import 'package:flutter_test/flutter_test.dart';
import 'package:techbrief_mobile/src/model/feed_article.dart';

FeedArticle article({
  String title = 'Original title',
  String? translatedTitle,
  String? summary,
  String? translatedSummary,
  String? bodyNormalized,
  String? translatedBodyNormalized,
  String? streamingBodyNormalized,
  Map<String, dynamic>? translatedBodyTiptapJson,
  String contentType = 'tech-news',
  String publishedAt = '2024-03-01T00:00:00.000Z',
  bool isTranslating = false,
  String? translationError,
}) {
  return FeedArticle(
    id: 'id',
    sourceId: 'src',
    sourceName: 'Source',
    contentType: contentType,
    title: title,
    translatedTitle: translatedTitle,
    summary: summary,
    translatedSummary: translatedSummary,
    publishedAt: publishedAt,
    originalUrl: 'https://example.com/p',
    bodyNormalized: bodyNormalized,
    translatedBodyNormalized: translatedBodyNormalized,
    streamingBodyNormalized: streamingBodyNormalized,
    translatedBodyTiptapJson: translatedBodyTiptapJson,
    isTranslating: isTranslating,
    translationError: translationError,
  );
}

void main() {
  group('display getters', () {
    test('displayTitle prefers the translation', () {
      expect(article(translatedTitle: '标题').displayTitle, '标题');
      expect(article().displayTitle, 'Original title');
    });

    test('displaySummary falls through translation -> summary -> body', () {
      expect(article(summary: 's', translatedSummary: 't').displaySummary, 't');
      expect(article(summary: 's').displaySummary, 's');
      expect(article(bodyNormalized: 'b').displaySummary, 'b');
    });

    test('displayBody prefers streaming, then translation, then body', () {
      expect(
        article(bodyNormalized: 'b', translatedBodyNormalized: 't', streamingBodyNormalized: 's').displayBody,
        's',
      );
      expect(article(bodyNormalized: 'b', translatedBodyNormalized: 't').displayBody, 't');
    });

    test('channelLabel maps content type', () {
      expect(article(contentType: 'indie-dev').channelLabel, 'Indie Dev');
      expect(article(contentType: 'tech-news').channelLabel, 'Tech News');
    });

    test('hasTranslation reflects translated body presence', () {
      expect(article().hasTranslation, isFalse);
      expect(article(translatedBodyNormalized: 'x').hasTranslation, isTrue);
      expect(article(translatedBodyTiptapJson: {'type': 'doc'}).hasTranslation, isTrue);
    });
  });

  group('readMinutes', () {
    test('counts latin text by words', () {
      final text = List.filled(660, 'word').join(' ');
      expect(article(bodyNormalized: text).readMinutes, 3);
    });

    test('counts CJK text by characters', () {
      final text = List.filled(800, '字').join();
      expect(article(bodyNormalized: text).readMinutes, 2);
    });

    test('clamps to a 1 minute minimum', () {
      expect(article().readMinutes, 1);
    });
  });

  group('publishedDateTime', () {
    test('parses an ISO string', () {
      expect(article(publishedAt: '2024-03-01T00:00:00.000Z').publishedDateTime.toUtc().year, 2024);
    });

    test('falls back to now on a bad value', () {
      expect(article(publishedAt: 'not-a-date').publishedDateTime, isA<DateTime>());
    });
  });

  group('copyWith', () {
    test('overlays translated title and toggles translating', () {
      final next = article().copyWith(translatedTitle: 'T', isTranslating: true);
      expect(next.displayTitle, 'T');
      expect(next.isTranslating, isTrue);
    });

    test('clearStreamingBody and clearTranslationError reset fields', () {
      final base = article(streamingBodyNormalized: 's', translationError: 'err');
      final cleared = base.copyWith(clearStreamingBody: true, clearTranslationError: true);
      expect(cleared.streamingBodyNormalized, isNull);
      expect(cleared.translationError, isNull);
    });
  });

  group('json + cache', () {
    test('fromJson applies defaults for missing fields', () {
      final a = FeedArticle.fromJson(<String, dynamic>{});
      expect(a.sourceName, 'Unknown');
      expect(a.title, 'Untitled');
      expect(a.contentType, 'tech-news');
    });

    test('FeedPage.fromJson reads items and total', () {
      final page = FeedPage.fromJson(<String, dynamic>{
        'items': [
          {'id': '1', 'title': 'A'},
          {'id': '2', 'title': 'B'},
        ],
        'total': 5,
      });
      expect(page.items, hasLength(2));
      expect(page.total, 5);
    });

    test('encode/decode round-trips articles', () {
      final encoded = encodeArticles([article(title: 'Keep me')]);
      final decoded = decodeArticles(encoded);
      expect(decoded, hasLength(1));
      expect(decoded.first.title, 'Keep me');
    });

    test('decodeArticles returns empty on bad input', () {
      expect(decodeArticles(null), isEmpty);
      expect(decodeArticles('not json'), isEmpty);
    });
  });

  group('fallbackTiptapDoc', () {
    test('splits paragraphs on blank lines', () {
      final doc = fallbackTiptapDoc('para one\n\npara two');
      expect(doc['type'], 'doc');
      expect((doc['content'] as List), hasLength(2));
    });
  });
}
