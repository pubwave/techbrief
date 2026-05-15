import '../../theme/app_theme.dart';
import '../app_strings.dart';

final AppStrings frStrings = AppStrings(
  menuFeed: 'Flux',
  menuSettings: 'Réglages',
  signalReader: 'Lecteur de signaux',
  channel: 'Canal',
  techNewsFilter: 'Entreprises et médias',
  indieDevFilter: 'Développeurs indé',
  itemsCount: (value) => '$value éléments',
  searchPlaceholder: 'Rechercher des entreprises, lancements, fondateurs...',
  backToFeed: '<- Flux',
  openSourceLink: 'Ouvrir le lien source',
  unableToOpenSourceLink: 'Impossible d’ouvrir le lien source.',
  settingsTitle: 'Réglages',
  settingsDescription:
      'Pointez l’app vers votre serveur TechBrief, puis synchronisez les articles récents dans SQLite local.',
  apiBaseUrl: 'URL de base de l’API',
  apiBaseUrlHint: 'http://127.0.0.1:4310',
  apiBaseUrlHelp:
      'L’émulateur Android nécessite généralement 10.0.2.2. Le simulateur iOS et le bureau peuvent utiliser 127.0.0.1.',
  saveServer: 'Enregistrer le serveur',
  syncNow: 'Synchroniser',
  syncingNow: 'Synchronisation…',
  savedServerAddress: 'Adresse du serveur enregistrée.',
  syncingLatestArticles: 'Synchronisation des derniers articles…',
  syncedArticles: (count, baseUrl) =>
      '$count articles synchronisés depuis $baseUrl.',
  usingLocalCache: (error) => 'Utilisation du cache local. $error',
  themeTitle: 'Thème',
  themeDescription:
      'Conservez l’apparence actuelle par défaut ou passez à l’une des directions visuelles supplémentaires.',
  active: 'Actif',
  apply: 'Appliquer',
  minutesAgo: (value) => 'il y a $value min',
  hoursAgo: (value) => 'il y a $value h',
  daysAgo: (value) => 'il y a $value jour${value == 1 ? '' : 's'}',
  justNow: 'À l’instant',
  themeLabels: const <AppThemeId, String>{
    AppThemeId.currentTheme: 'Signal profond',
    AppThemeId.editorialDawn: 'Édition du matin',
    AppThemeId.auroraGlass: 'Verre aurore',
  },
  themeSummaries: const <AppThemeId, String>{
    AppThemeId.currentTheme:
        'Une surface de lecture bleu profond plus lumineuse, avec des accents cyan et des couches plus nettes.',
    AppThemeId.editorialDawn:
        'Un espace clair aux tons papier chauds, avec des accents bleus nets pour les signaux clés.',
    AppThemeId.auroraGlass:
        'Une interface vitrée plus froide, tirant vers le teal, avec une profondeur plus douce et plus de transparence.',
  },
);
