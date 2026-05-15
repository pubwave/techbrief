import 'dart:convert';
import 'dart:io';

class FeedAppConfigClient {
  FeedAppConfigClient(this.baseUrl);

  final String baseUrl;

  Future<String> fetchDefaultLanguage() async {
    final sanitizedBaseUrl = baseUrl.trim().replaceAll(RegExp(r'/+$'), '');
    final uri = Uri.parse('$sanitizedBaseUrl/v1/config');
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
      final app = payload['app'] as Map<String, Object?>?;
      return app?['defaultLanguage'] as String? ?? 'en';
    } finally {
      client.close(force: true);
    }
  }
}
