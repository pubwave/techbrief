import '../../theme/app_theme.dart';
import '../app_strings.dart';

final AppStrings esStrings = AppStrings(
  menuFeed: 'Feed',
  menuSettings: 'Ajustes',
  signalReader: 'Lector de señales',
  channel: 'Canal',
  techNewsFilter: 'Empresas y medios',
  indieDevFilter: 'Desarrolladores indie',
  itemsCount: (value) => '$value elementos',
  searchPlaceholder: 'Buscar empresas, lanzamientos, fundadores...',
  backToFeed: '<- Feed',
  openSourceLink: 'Abrir enlace original',
  unableToOpenSourceLink: 'No se pudo abrir el enlace original.',
  settingsTitle: 'Ajustes',
  settingsDescription:
      'Apunta la app a tu servidor de TechBrief y luego sincroniza artículos recientes en SQLite local.',
  apiBaseUrl: 'URL base de la API',
  apiBaseUrlHint: 'http://127.0.0.1:4310',
  apiBaseUrlHelp:
      'El emulador de Android suele necesitar 10.0.2.2. El simulador de iOS y el escritorio pueden usar 127.0.0.1.',
  saveServer: 'Guardar servidor',
  syncNow: 'Sincronizar ahora',
  syncingNow: 'Sincronizando…',
  savedServerAddress: 'Dirección del servidor guardada.',
  syncingLatestArticles: 'Sincronizando los artículos más recientes…',
  syncedArticles: (count, baseUrl) =>
      'Se sincronizaron $count artículos desde $baseUrl.',
  usingLocalCache: (error) => 'Usando caché local. $error',
  themeTitle: 'Tema',
  themeDescription:
      'Mantén el aspecto actual como predeterminado o cambia a una de las direcciones visuales adicionales.',
  active: 'Activo',
  apply: 'Aplicar',
  minutesAgo: (value) => 'hace $value min',
  hoursAgo: (value) => 'hace $value h',
  daysAgo: (value) => 'hace $value día${value == 1 ? '' : 's'}',
  justNow: 'Ahora mismo',
  themeLabels: const <AppThemeId, String>{
    AppThemeId.currentTheme: 'Señal profunda',
    AppThemeId.editorialDawn: 'Edición matinal',
    AppThemeId.auroraGlass: 'Cristal aurora',
  },
  themeSummaries: const <AppThemeId, String>{
    AppThemeId.currentTheme:
        'Una superficie de lectura azul profunda, más luminosa, con acentos cian y capas más claras.',
    AppThemeId.editorialDawn:
        'Un espacio cálido con textura de papel y acentos azules limpios para destacar señales clave.',
    AppThemeId.auroraGlass:
        'Una interfaz de vidrio en tonos teal, más fría, con profundidad suave y un aire más translúcido.',
  },
);
