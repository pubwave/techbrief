import '../model/feed_article.dart';

sealed class TranslationEvent {
  const TranslationEvent();
}

class TranslationPartial extends TranslationEvent {
  const TranslationPartial({this.bodyNormalized, this.bodyTiptapJson});

  final String? bodyNormalized;
  final Map<String, dynamic>? bodyTiptapJson;
}

class TranslationCompleted extends TranslationEvent {
  const TranslationCompleted(this.article);

  final FeedArticle article;
}

class TranslationFailed extends TranslationEvent {
  const TranslationFailed(this.message);

  final String message;
}
