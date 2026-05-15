import 'dart:convert';
import 'dart:io';

import 'feed_article.dart';

class FeedApiClient {
  FeedApiClient(this.baseUrl);

  final String baseUrl;

  Future<List<FeedArticle>> fetchArticles(String language) async {
    final techNews = await _fetchCategory('tech-news', language);
    final indieDevelopers = await _fetchCategory('indie-dev', language);
    return <FeedArticle>[...techNews, ...indieDevelopers]
      ..sort((left, right) => right.publishedAt.compareTo(left.publishedAt));
  }

  Future<List<FeedArticle>> _fetchCategory(
    String category,
    String language,
  ) async {
    final sanitizedBaseUrl = baseUrl.trim().replaceAll(RegExp(r'/+$'), '');
    final uri = Uri.parse(
      '$sanitizedBaseUrl/v1/feed?category=$category&language=${Uri.encodeQueryComponent(language)}&limit=20',
    );
    final client = HttpClient();

    try {
      final request = await client.getUrl(uri);
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException(
          'Server returned ${response.statusCode} for ${uri.path}.',
          uri: uri,
        );
      }

      final payload = jsonDecode(body) as Map<String, Object?>;
      final items = (payload['items'] as List<Object?>? ?? const <Object?>[])
          .cast<Map<String, Object?>>();
      return items.map(FeedArticle.fromRemoteJson).toList();
    } finally {
      client.close(force: true);
    }
  }
}
