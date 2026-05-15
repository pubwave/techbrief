import '../../theme/app_theme.dart';

class FeedSettings {
  const FeedSettings({required this.apiBaseUrl, required this.themeId});

  final String apiBaseUrl;
  final AppThemeId themeId;

  FeedSettings copyWith({String? apiBaseUrl, AppThemeId? themeId}) {
    return FeedSettings(
      apiBaseUrl: apiBaseUrl ?? this.apiBaseUrl,
      themeId: themeId ?? this.themeId,
    );
  }
}
