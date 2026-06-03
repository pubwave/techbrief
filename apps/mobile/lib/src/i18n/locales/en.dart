import '../../theme/palette.dart';
import '../app_strings.dart';

class EnStrings extends AppStrings {
  const EnStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => 'Your tech digest';

  @override
  String get tabFeed => 'Feed';
  @override
  String get tabSettings => 'Settings';
  @override
  String get channelAll => 'All';
  @override
  String get channelTechNews => 'Tech Media';
  @override
  String get channelIndieDev => 'Indie Dev';
  @override
  String get searchPlaceholder => 'Search articles, sources...';
  @override
  String get nextSyncLabel => 'Next sync in';
  @override
  String get syncingData => 'Syncing data';
  @override
  String get emptyFeed => 'This list is empty.';
  @override
  String get loadFeedError => 'Unable to load feed.';
  @override
  String get loadingMore => 'Loading more…';
  @override
  String get showingCached => 'Showing cached articles.';
  @override
  String itemsCount(int count) => '$count item${count == 1 ? '' : 's'}';

  @override
  String get translationInProgress => 'Translating';
  @override
  String get translationFailed => 'Translation failed';
  @override
  String get openSourceLink => 'Open source link';
  @override
  String get previousArticle => 'Previous';
  @override
  String get nextArticle => 'Next';

  @override
  String get settings => 'Settings';
  @override
  String get workspaceSettings => 'Appearance settings';
  @override
  String get workspaceSettingsDesc =>
      'Choose the visual theme used across the reader.';
  @override
  String get theme => 'Theme';
  @override
  String get themeDescription =>
      'Theme changes apply immediately and are saved on this device.';
  @override
  String get active => 'Active';
  @override
  String get apply => 'Apply';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => 'Deep Signal',
    AppThemeId.dawn => 'Morning Edition',
    AppThemeId.aurora => 'Aurora Glass',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current =>
      'A brighter deep-sea reading surface with cyan highlights and clearer layering.',
    AppThemeId.dawn =>
      'A warm paper-toned workspace with clean blue accents for key signals.',
    AppThemeId.aurora =>
      'A cooler teal-glass interface with softer depth and a more translucent feel.',
  };

  @override
  String relativeTime(DateTime dt) {
    String unit(int value, String label) =>
        '$value $label${value == 1 ? '' : 's'} ago';
    return formatRelativeTime(
      dt,
      now: 'just now',
      minute: (value) => unit(value, 'minute'),
      hour: (value) => unit(value, 'hour'),
      day: (value) => unit(value, 'day'),
      month: (value) => unit(value, 'month'),
      year: (value) => unit(value, 'year'),
    );
  }

  @override
  String readTime(int minutes) => '$minutes min';
}
