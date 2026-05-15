import '../../theme/app_theme.dart';
import '../app_strings.dart';

final AppStrings deStrings = AppStrings(
  menuFeed: 'Feed',
  menuSettings: 'Einstellungen',
  signalReader: 'Signal-Leser',
  channel: 'Kanal',
  techNewsFilter: 'Unternehmen und Medien',
  indieDevFilter: 'Indie-Entwickler',
  itemsCount: (value) => '$value Einträge',
  searchPlaceholder: 'Unternehmen, Launches, Gründer suchen...',
  backToFeed: '<- Feed',
  openSourceLink: 'Quelllink öffnen',
  unableToOpenSourceLink: 'Der Quelllink konnte nicht geöffnet werden.',
  settingsTitle: 'Einstellungen',
  settingsDescription:
      'Verbinden Sie die App mit Ihrem TechBrief-Server und synchronisieren Sie dann aktuelle Artikel in lokales SQLite.',
  apiBaseUrl: 'API-Basis-URL',
  apiBaseUrlHint: 'http://127.0.0.1:4310',
  apiBaseUrlHelp:
      'Der Android-Emulator benötigt normalerweise 10.0.2.2. iOS-Simulator und Desktop können 127.0.0.1 verwenden.',
  saveServer: 'Server speichern',
  syncNow: 'Jetzt synchronisieren',
  syncingNow: 'Synchronisierung…',
  savedServerAddress: 'Serveradresse gespeichert.',
  syncingLatestArticles: 'Neueste Artikel werden synchronisiert…',
  syncedArticles: (count, baseUrl) =>
      '$count Artikel von $baseUrl synchronisiert.',
  usingLocalCache: (error) => 'Lokaler Cache wird verwendet. $error',
  themeTitle: 'Thema',
  themeDescription:
      'Behalten Sie das aktuelle Aussehen als Standard bei oder wechseln Sie zu einer zusätzlichen visuellen Richtung.',
  active: 'Aktiv',
  apply: 'Anwenden',
  minutesAgo: (value) => 'vor $value Min.',
  hoursAgo: (value) => 'vor $value Std.',
  daysAgo: (value) => 'vor $value Tag${value == 1 ? '' : 'en'}',
  justNow: 'Gerade eben',
  themeLabels: const <AppThemeId, String>{
    AppThemeId.currentTheme: 'Tiefensignal',
    AppThemeId.editorialDawn: 'Morgenausgabe',
    AppThemeId.auroraGlass: 'Aurora Glass',
  },
  themeSummaries: const <AppThemeId, String>{
    AppThemeId.currentTheme:
        'Eine hellere tiefblaue Leseoberfläche mit Cyan-Akzenten und klarerer Staffelung.',
    AppThemeId.editorialDawn:
        'Eine warme, papierartige Oberfläche mit sauberen blauen Akzenten für wichtige Signale.',
    AppThemeId.auroraGlass:
        'Eine kühlere Glasoberfläche in Teal-Tönen mit weicherer Tiefe und mehr Transparenz.',
  },
);
