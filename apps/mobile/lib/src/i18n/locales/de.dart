import '../../theme/palette.dart';
import '../app_strings.dart';

class DeStrings extends AppStrings {
  const DeStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => 'Tech-Digest';

  @override
  String get tabFeed => 'Start';
  @override
  String get tabSettings => 'Einstellungen';
  @override
  String get channelAll => 'Alle';
  @override
  String get channelTechNews => 'Tech-Medien';
  @override
  String get channelIndieDev => 'Indie-Entwicklung';
  @override
  String get searchPlaceholder => 'Artikel und Quellen suchen...';
  @override
  String get nextSyncLabel => 'Nächste Synchronisierung in';
  @override
  String get syncingData => 'Daten werden synchronisiert';
  @override
  String get emptyFeed => 'Diese Liste ist leer.';
  @override
  String get loadFeedError => 'Feed konnte nicht geladen werden.';
  @override
  String get loadingMore => 'Weitere Inhalte werden geladen…';
  @override
  String get showingCached => 'Zeige zwischengespeicherte Artikel.';
  @override
  String itemsCount(int count) => '$count Einträge';

  @override
  String get translationInProgress => 'Übersetzung läuft';
  @override
  String get translationFailed => 'Übersetzung fehlgeschlagen';
  @override
  String get openSourceLink => 'Quelllink öffnen';
  @override
  String get previousArticle => 'Zurück';
  @override
  String get nextArticle => 'Weiter';

  @override
  String get settings => 'Einstellungen';
  @override
  String get workspaceSettings => 'Darstellungseinstellungen';
  @override
  String get workspaceSettingsDesc =>
      'Wählen Sie das visuelle Thema für den gesamten Reader.';
  @override
  String get theme => 'Thema';
  @override
  String get themeDescription =>
      'Designänderungen werden sofort übernommen und auf diesem Gerät gespeichert.';
  @override
  String get active => 'Aktiv';
  @override
  String get apply => 'Anwenden';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => 'Tiefensignal',
    AppThemeId.dawn => 'Morgenausgabe',
    AppThemeId.aurora => 'Aurora Glass',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current =>
      'Eine hellere tiefblaue Leseoberfläche mit Cyan-Akzenten und klarerer Staffelung.',
    AppThemeId.dawn =>
      'Eine warme, papierartige Oberfläche mit sauberen blauen Akzenten für wichtige Signale.',
    AppThemeId.aurora =>
      'Eine kühlere Glasoberfläche in Teal-Tönen mit weicherer Tiefe und mehr Transparenz.',
  };

  @override
  String relativeTime(DateTime dt) {
    String unit(int value, String singular, [String? plural]) {
      return 'vor $value ${value == 1 ? singular : plural ?? '${singular}n'}';
    }

    return formatRelativeTime(
      dt,
      now: 'gerade eben',
      minute: (value) => unit(value, 'Minute'),
      hour: (value) => unit(value, 'Stunde'),
      day: (value) => unit(value, 'Tag', 'Tagen'),
      month: (value) => unit(value, 'Monat', 'Monaten'),
      year: (value) => unit(value, 'Jahr', 'Jahren'),
    );
  }

  @override
  String readTime(int minutes) => '$minutes Min.';
}
