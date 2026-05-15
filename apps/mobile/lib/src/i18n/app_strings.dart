import '../theme/app_theme.dart';

typedef CountFormatter = String Function(int value);

class AppStrings {
  const AppStrings({
    required this.menuFeed,
    required this.menuSettings,
    required this.signalReader,
    required this.channel,
    required this.techNewsFilter,
    required this.indieDevFilter,
    required this.itemsCount,
    required this.searchPlaceholder,
    required this.backToFeed,
    required this.openSourceLink,
    required this.unableToOpenSourceLink,
    required this.settingsTitle,
    required this.settingsDescription,
    required this.apiBaseUrl,
    required this.apiBaseUrlHint,
    required this.apiBaseUrlHelp,
    required this.saveServer,
    required this.syncNow,
    required this.syncingNow,
    required this.savedServerAddress,
    required this.syncingLatestArticles,
    required this.syncedArticles,
    required this.usingLocalCache,
    required this.themeTitle,
    required this.themeDescription,
    required this.active,
    required this.apply,
    required this.minutesAgo,
    required this.hoursAgo,
    required this.daysAgo,
    required this.justNow,
    required this.themeLabels,
    required this.themeSummaries,
  });

  final String menuFeed;
  final String menuSettings;
  final String signalReader;
  final String channel;
  final String techNewsFilter;
  final String indieDevFilter;
  final CountFormatter itemsCount;
  final String searchPlaceholder;
  final String backToFeed;
  final String openSourceLink;
  final String unableToOpenSourceLink;
  final String settingsTitle;
  final String settingsDescription;
  final String apiBaseUrl;
  final String apiBaseUrlHint;
  final String apiBaseUrlHelp;
  final String saveServer;
  final String syncNow;
  final String syncingNow;
  final String savedServerAddress;
  final String Function(int count, String baseUrl) syncedArticles;
  final String Function(String error) usingLocalCache;
  final String syncingLatestArticles;
  final String themeTitle;
  final String themeDescription;
  final String active;
  final String apply;
  final String Function(int value) minutesAgo;
  final String Function(int value) hoursAgo;
  final String Function(int value) daysAgo;
  final String justNow;
  final Map<AppThemeId, String> themeLabels;
  final Map<AppThemeId, String> themeSummaries;

  String themeLabel(AppThemeId themeId) => themeLabels[themeId] ?? '';

  String themeSummary(AppThemeId themeId) => themeSummaries[themeId] ?? '';
}
