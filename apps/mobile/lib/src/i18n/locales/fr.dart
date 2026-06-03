import '../../theme/palette.dart';
import '../app_strings.dart';

class FrStrings extends AppStrings {
  const FrStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => 'Votre veille tech';

  @override
  String get tabFeed => 'Accueil';
  @override
  String get tabSettings => 'Réglages';
  @override
  String get channelAll => 'Tout';
  @override
  String get channelTechNews => 'Médias tech';
  @override
  String get channelIndieDev => 'Développement indé';
  @override
  String get searchPlaceholder => 'Rechercher articles et sources...';
  @override
  String get nextSyncLabel => 'Prochaine synchro dans';
  @override
  String get syncingData => 'Synchronisation des données';
  @override
  String get emptyFeed => 'Cette liste est vide.';
  @override
  String get loadFeedError => 'Impossible de charger le flux.';
  @override
  String get loadingMore => 'Chargement supplémentaire…';
  @override
  String get showingCached => 'Affichage des articles en cache.';
  @override
  String itemsCount(int count) => '$count élément${count == 1 ? '' : 's'}';

  @override
  String get translationInProgress => 'Traduction en cours';
  @override
  String get translationFailed => 'Échec de la traduction';
  @override
  String get openSourceLink => 'Ouvrir le lien source';
  @override
  String get previousArticle => 'Précédent';
  @override
  String get nextArticle => 'Suivant';

  @override
  String get settings => 'Réglages';
  @override
  String get workspaceSettings => "Réglages d'apparence";
  @override
  String get workspaceSettingsDesc =>
      'Choisissez le thème visuel utilisé dans tout le lecteur.';
  @override
  String get theme => 'Thème';
  @override
  String get themeDescription =>
      'Les changements de thème s\'appliquent immédiatement et sont enregistrés sur cet appareil.';
  @override
  String get active => 'Actif';
  @override
  String get apply => 'Appliquer';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => 'Signal profond',
    AppThemeId.dawn => 'Édition du matin',
    AppThemeId.aurora => 'Verre aurore',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current =>
      'Une surface de lecture bleu profond plus lumineuse, avec des accents cyan et des couches plus nettes.',
    AppThemeId.dawn =>
      'Un espace clair aux tons papier chauds, avec des accents bleus nets pour les signaux clés.',
    AppThemeId.aurora =>
      'Une interface vitrée plus froide, tirant vers le teal, avec une profondeur plus douce et plus de transparence.',
  };

  @override
  String relativeTime(DateTime dt) {
    String unit(int value, String singular, [String? plural]) {
      return 'il y a $value ${value == 1 ? singular : plural ?? '${singular}s'}';
    }

    return formatRelativeTime(
      dt,
      now: 'à l\'instant',
      minute: (value) => unit(value, 'minute'),
      hour: (value) => unit(value, 'heure'),
      day: (value) => unit(value, 'jour'),
      month: (value) => unit(value, 'mois', 'mois'),
      year: (value) => unit(value, 'an', 'ans'),
    );
  }

  @override
  String readTime(int minutes) => '$minutes min';
}
