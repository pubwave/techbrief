import '../../theme/palette.dart';
import '../app_strings.dart';

class JaStrings extends AppStrings {
  const JaStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => 'テック速報';

  @override
  String get tabFeed => 'ホーム';
  @override
  String get tabSettings => '設定';
  @override
  String get channelAll => 'すべて';
  @override
  String get channelTechNews => 'テックメディア';
  @override
  String get channelIndieDev => 'インディー開発';
  @override
  String get searchPlaceholder => '記事・ソースを検索...';
  @override
  String get nextSyncLabel => '次の同期まで';
  @override
  String get syncingData => 'データを同期中';
  @override
  String get emptyFeed => '現在リストは空です。';
  @override
  String get loadFeedError => 'フィードを読み込めません。';
  @override
  String get loadingMore => 'さらに読み込み中…';
  @override
  String get showingCached => 'キャッシュ記事を表示中。';
  @override
  String itemsCount(int count) => '$count 件';

  @override
  String get translationInProgress => '翻訳中';
  @override
  String get translationFailed => '翻訳に失敗しました';
  @override
  String get openSourceLink => '元記事を開く';
  @override
  String get previousArticle => '前の記事';
  @override
  String get nextArticle => '次の記事';

  @override
  String get settings => '設定';
  @override
  String get workspaceSettings => '外観設定';
  @override
  String get workspaceSettingsDesc => 'リーダー全体で使うテーマを選択します。';
  @override
  String get theme => 'テーマ';
  @override
  String get themeDescription => 'テーマはすぐに反映され、このデバイスに保存されます。';
  @override
  String get active => '適用中';
  @override
  String get apply => '適用';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => 'ディープシグナル',
    AppThemeId.dawn => 'モーニングエディション',
    AppThemeId.aurora => 'オーロラ・グラス',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current => 'シアンのハイライトと明快なレイヤー感を備えた、より明るい深海ブルーの読書画面です。',
    AppThemeId.dawn => '紙面のような温かい明るさに、クリーンなブルーアクセントを添えたワークスペースです。',
    AppThemeId.aurora => 'ティール寄りのガラス調で、柔らかな奥行きと軽い透明感を持つ画面です。',
  };

  @override
  String relativeTime(DateTime dt) {
    return formatRelativeTime(
      dt,
      now: 'たった今',
      minute: (value) => '$value分前',
      hour: (value) => '$value時間前',
      day: (value) => '$value日前',
      month: (value) => '$valueか月前',
      year: (value) => '$value年前',
    );
  }

  @override
  String readTime(int minutes) => '$minutes 分';
}
