import '../../theme/palette.dart';
import '../app_strings.dart';

class PtStrings extends AppStrings {
  const PtStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => 'Seu digest de tecnologia';

  @override
  String get tabFeed => 'Início';
  @override
  String get tabSettings => 'Configurações';
  @override
  String get channelAll => 'Tudo';
  @override
  String get channelTechNews => 'Mídia tech';
  @override
  String get channelIndieDev => 'Desenvolvimento indie';
  @override
  String get searchPlaceholder => 'Pesquisar artigos e fontes...';
  @override
  String get nextSyncLabel => 'Próxima sincronização em';
  @override
  String get syncingData => 'Sincronizando dados';
  @override
  String get emptyFeed => 'Esta lista está vazia.';
  @override
  String get loadFeedError => 'Não foi possível carregar o feed.';
  @override
  String get loadingMore => 'Carregando mais…';
  @override
  String get showingCached => 'Exibindo artigos em cache.';
  @override
  String itemsCount(int count) => '$count iten${count == 1 ? '' : 's'}';

  @override
  String get translationInProgress => 'Traduzindo';
  @override
  String get translationFailed => 'Falha na tradução';
  @override
  String get openSourceLink => 'Abrir link da fonte';
  @override
  String get previousArticle => 'Anterior';
  @override
  String get nextArticle => 'Próximo';

  @override
  String get settings => 'Configurações';
  @override
  String get workspaceSettings => 'Configurações de aparência';
  @override
  String get workspaceSettingsDesc =>
      'Escolha o tema visual usado em todo o leitor.';
  @override
  String get theme => 'Tema';
  @override
  String get themeDescription =>
      'As mudanças de tema são aplicadas imediatamente e salvas neste dispositivo.';
  @override
  String get active => 'Ativo';
  @override
  String get apply => 'Aplicar';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => 'Sinal profundo',
    AppThemeId.dawn => 'Edição da manhã',
    AppThemeId.aurora => 'Vidro aurora',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current =>
      'Uma superfície de leitura azul-profunda mais luminosa, com realces em ciano e camadas mais claras.',
    AppThemeId.dawn =>
      'Um espaço claro com sensação de papel e acentos azuis limpos para destacar sinais importantes.',
    AppThemeId.aurora =>
      'Uma interface vítrea mais fria, em tons de teal, com profundidade suave e sensação mais translúcida.',
  };

  @override
  String relativeTime(DateTime dt) {
    String unit(int value, String singular, [String? plural]) {
      return 'há $value ${value == 1 ? singular : plural ?? '${singular}s'}';
    }

    return formatRelativeTime(
      dt,
      now: 'agora mesmo',
      minute: (value) => unit(value, 'minuto'),
      hour: (value) => unit(value, 'hora'),
      day: (value) => unit(value, 'dia'),
      month: (value) => unit(value, 'mês', 'meses'),
      year: (value) => unit(value, 'ano'),
    );
  }

  @override
  String readTime(int minutes) => '$minutes min';
}
