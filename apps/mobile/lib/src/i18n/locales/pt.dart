import '../../theme/app_theme.dart';
import '../app_strings.dart';

final AppStrings ptStrings = AppStrings(
  menuFeed: 'Feed',
  menuSettings: 'Configurações',
  signalReader: 'Leitor de sinais',
  channel: 'Canal',
  techNewsFilter: 'Empresas e mídia',
  indieDevFilter: 'Desenvolvedores indie',
  itemsCount: (value) => '$value itens',
  searchPlaceholder: 'Pesquisar empresas, lançamentos, fundadores...',
  backToFeed: '<- Feed',
  openSourceLink: 'Abrir link da fonte',
  unableToOpenSourceLink: 'Não foi possível abrir o link da fonte.',
  settingsTitle: 'Configurações',
  settingsDescription:
      'Aponte o app para o seu servidor TechBrief e sincronize artigos recentes no SQLite local.',
  apiBaseUrl: 'URL base da API',
  apiBaseUrlHint: 'http://127.0.0.1:4310',
  apiBaseUrlHelp:
      'O emulador Android normalmente precisa de 10.0.2.2. O simulador iOS e o desktop podem usar 127.0.0.1.',
  saveServer: 'Salvar servidor',
  syncNow: 'Sincronizar agora',
  syncingNow: 'Sincronizando…',
  savedServerAddress: 'Endereço do servidor salvo.',
  syncingLatestArticles: 'Sincronizando os artigos mais recentes…',
  syncedArticles: (count, baseUrl) =>
      '$count artigos sincronizados de $baseUrl.',
  usingLocalCache: (error) => 'Usando cache local. $error',
  themeTitle: 'Tema',
  themeDescription:
      'Mantenha a aparência atual como padrão ou mude para uma das direções visuais adicionais.',
  active: 'Ativo',
  apply: 'Aplicar',
  minutesAgo: (value) => 'há $value min',
  hoursAgo: (value) => 'há $value h',
  daysAgo: (value) => 'há $value dia${value == 1 ? '' : 's'}',
  justNow: 'Agora mesmo',
  themeLabels: const <AppThemeId, String>{
    AppThemeId.currentTheme: 'Sinal profundo',
    AppThemeId.editorialDawn: 'Edição da manhã',
    AppThemeId.auroraGlass: 'Vidro aurora',
  },
  themeSummaries: const <AppThemeId, String>{
    AppThemeId.currentTheme:
        'Uma superfície de leitura azul-profunda mais luminosa, com realces em ciano e camadas mais claras.',
    AppThemeId.editorialDawn:
        'Um espaço claro com sensação de papel e acentos azuis limpos para destacar sinais importantes.',
    AppThemeId.auroraGlass:
        'Uma interface vítrea mais fria, em tons de teal, com profundidade suave e sensação mais translúcida.',
  },
);
