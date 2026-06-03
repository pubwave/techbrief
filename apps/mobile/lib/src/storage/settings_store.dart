import 'package:shared_preferences/shared_preferences.dart';

import '../model/feed_article.dart';
import '../theme/palette.dart';

class SettingsStore {
  static const _kTheme = 'techbrief.theme';
  static const _kCache = 'techbrief.feedCache';
  static const _kLanguage = 'techbrief.language';

  Future<AppThemeId> loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    return AppThemeId.fromValue(prefs.getString(_kTheme));
  }

  Future<void> saveTheme(AppThemeId theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kTheme, theme.value);
  }

  // Last known UI language (the configured defaultLanguage), cached so the app
  // can render in the right language on launch before the network responds.
  Future<String?> loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kLanguage);
  }

  Future<void> saveLanguage(String language) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLanguage, language);
  }

  Future<List<FeedArticle>> loadCachedFeed() async {
    final prefs = await SharedPreferences.getInstance();
    return decodeArticles(prefs.getString(_kCache));
  }

  Future<void> saveCachedFeed(List<FeedArticle> articles) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kCache, encodeArticles(articles.take(60).toList()));
  }
}
