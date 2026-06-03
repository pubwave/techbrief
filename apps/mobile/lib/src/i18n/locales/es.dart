import '../../theme/palette.dart';
import '../app_strings.dart';

class EsStrings extends AppStrings {
  const EsStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => 'Tu resumen tech';

  @override
  String get tabFeed => 'Inicio';
  @override
  String get tabSettings => 'Ajustes';
  @override
  String get channelAll => 'Todo';
  @override
  String get channelTechNews => 'Medios tech';
  @override
  String get channelIndieDev => 'Desarrollo indie';
  @override
  String get searchPlaceholder => 'Buscar artículos y fuentes...';
  @override
  String get nextSyncLabel => 'Próxima sincronización en';
  @override
  String get syncingData => 'Sincronizando datos';
  @override
  String get emptyFeed => 'Esta lista está vacía.';
  @override
  String get loadFeedError => 'No se pudo cargar el feed.';
  @override
  String get loadingMore => 'Cargando más…';
  @override
  String get showingCached => 'Mostrando artículos en caché.';
  @override
  String itemsCount(int count) => '$count elemento${count == 1 ? '' : 's'}';

  @override
  String get translationInProgress => 'Traduciendo';
  @override
  String get translationFailed => 'Error de traducción';
  @override
  String get openSourceLink => 'Abrir enlace original';
  @override
  String get previousArticle => 'Anterior';
  @override
  String get nextArticle => 'Siguiente';

  @override
  String get settings => 'Ajustes';
  @override
  String get workspaceSettings => 'Ajustes de apariencia';
  @override
  String get workspaceSettingsDesc =>
      'Elige el tema visual usado en todo el lector.';
  @override
  String get theme => 'Tema';
  @override
  String get themeDescription =>
      'Los cambios de tema se aplican al instante y se guardan en este dispositivo.';
  @override
  String get active => 'Activo';
  @override
  String get apply => 'Aplicar';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => 'Señal profunda',
    AppThemeId.dawn => 'Edición matinal',
    AppThemeId.aurora => 'Cristal aurora',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current =>
      'Una superficie de lectura azul profunda, más luminosa, con acentos cian y capas más claras.',
    AppThemeId.dawn =>
      'Un espacio cálido con textura de papel y acentos azules limpios para destacar señales clave.',
    AppThemeId.aurora =>
      'Una interfaz de vidrio en tonos teal, más fría, con profundidad suave y un aire más translúcido.',
  };

  @override
  String relativeTime(DateTime dt) {
    String unit(int value, String singular, [String? plural]) {
      return 'hace $value ${value == 1 ? singular : plural ?? '${singular}s'}';
    }

    return formatRelativeTime(
      dt,
      now: 'ahora mismo',
      minute: (value) => unit(value, 'minuto'),
      hour: (value) => unit(value, 'hora'),
      day: (value) => unit(value, 'día', 'días'),
      month: (value) => unit(value, 'mes', 'meses'),
      year: (value) => unit(value, 'año'),
    );
  }

  @override
  String readTime(int minutes) => '$minutes min';
}
