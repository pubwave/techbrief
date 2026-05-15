import '../../theme/app_theme.dart';
import '../app_strings.dart';

final AppStrings enStrings = AppStrings(
  menuFeed: 'Feed',
  menuSettings: 'Settings',
  signalReader: 'Signal reader',
  channel: 'Channel',
  techNewsFilter: 'Companies + Media',
  indieDevFilter: 'Indie Developers',
  itemsCount: (value) => '$value items',
  searchPlaceholder: 'Search companies, launches, founders...',
  backToFeed: '<- Feed',
  openSourceLink: 'Open source link',
  unableToOpenSourceLink: 'Unable to open the source link.',
  settingsTitle: 'Settings',
  settingsDescription:
      'Point the app at your TechBrief server, then sync fresh articles into local SQLite.',
  apiBaseUrl: 'API base URL',
  apiBaseUrlHint: 'http://127.0.0.1:4310',
  apiBaseUrlHelp:
      'Android emulator usually needs 10.0.2.2. iOS simulator and desktop can use 127.0.0.1.',
  saveServer: 'Save server',
  syncNow: 'Sync now',
  syncingNow: 'Syncing...',
  savedServerAddress: 'Saved server address.',
  syncingLatestArticles: 'Syncing latest articles...',
  syncedArticles: (count, baseUrl) => 'Synced $count articles from $baseUrl.',
  usingLocalCache: (error) => 'Using local cache. $error',
  themeTitle: 'Theme',
  themeDescription:
      'Keep the current look as default, or switch to one of the additional visual directions.',
  active: 'Active',
  apply: 'Apply',
  minutesAgo: (value) => '$value min ago',
  hoursAgo: (value) => '$value hr ago',
  daysAgo: (value) => '$value day${value == 1 ? '' : 's'} ago',
  justNow: 'Just now',
  themeLabels: const <AppThemeId, String>{
    AppThemeId.currentTheme: 'Current Theme',
    AppThemeId.editorialDawn: 'Editorial Dawn',
    AppThemeId.auroraGlass: 'Aurora Glass',
  },
  themeSummaries: const <AppThemeId, String>{
    AppThemeId.currentTheme:
        'The original dark reading workspace with the existing cyan accent.',
    AppThemeId.editorialDawn:
        'A brighter editorial surface with warm neutrals and a restrained blue accent.',
    AppThemeId.auroraGlass:
        'A cooler, glassy dark mode with emerald-cyan highlights and softer depth.',
  },
);
