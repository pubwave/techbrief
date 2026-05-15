import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../theme/app_theme.dart';
import 'feed_settings.dart';

class FeedSettingsRepository {
  FeedSettingsRepository._();

  static final FeedSettingsRepository instance = FeedSettingsRepository._();

  static const _apiBaseUrlKey = 'feed_api_base_url';
  static const _themeIdKey = 'feed_theme_id';

  Future<FeedSettings> loadSettings() async {
    final preferences = await SharedPreferences.getInstance();
    return FeedSettings(
      apiBaseUrl: preferences.getString(_apiBaseUrlKey) ?? _defaultApiBaseUrl(),
      themeId: appThemeIdFromStorage(preferences.getString(_themeIdKey)),
    );
  }

  Future<void> saveSettings(FeedSettings settings) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_apiBaseUrlKey, settings.apiBaseUrl.trim());
    await preferences.setString(_themeIdKey, settings.themeId.storageValue);
  }

  String _defaultApiBaseUrl() {
    if (kIsWeb) {
      return 'http://127.0.0.1:4310';
    }

    if (Platform.isAndroid) {
      return 'http://10.0.2.2:4310';
    }

    return 'http://127.0.0.1:4310';
  }
}
