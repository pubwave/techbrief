import '../../theme/palette.dart';
import '../app_strings.dart';

class ZhTwStrings extends AppStrings {
  const ZhTwStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => '精選速報';

  @override
  String get tabFeed => '首頁';
  @override
  String get tabSettings => '設定';
  @override
  String get channelAll => '全部';
  @override
  String get channelTechNews => '科技媒體';
  @override
  String get channelIndieDev => '獨立開發';
  @override
  String get searchPlaceholder => '搜尋文章、來源……';
  @override
  String get nextSyncLabel => '下次同步';
  @override
  String get syncingData => '正在同步資料';
  @override
  String get emptyFeed => '目前列表為空';
  @override
  String get loadFeedError => '無法載入資訊流。';
  @override
  String get loadingMore => '正在載入更多…';
  @override
  String get showingCached => '顯示快取內容。';
  @override
  String itemsCount(int count) => '$count 則';

  @override
  String get translationInProgress => '正在翻譯';
  @override
  String get translationFailed => '翻譯失敗';
  @override
  String get openSourceLink => '打開原始連結';
  @override
  String get previousArticle => '上一篇';
  @override
  String get nextArticle => '下一篇';

  @override
  String get settings => '設定';
  @override
  String get workspaceSettings => '外觀設定';
  @override
  String get workspaceSettingsDesc => '選擇閱讀器使用的介面主題。';
  @override
  String get theme => '主題';
  @override
  String get themeDescription => '主題會立即生效，並儲存在這台裝置上。';
  @override
  String get active => '目前';
  @override
  String get apply => '套用';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => '深海訊號',
    AppThemeId.dawn => '晨光紙頁',
    AppThemeId.aurora => '極光玻璃',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current => '更明亮的深海藍閱讀介面，保留青色高亮與清楚層次。',
    AppThemeId.dawn => '帶紙頁質感的暖白介面，用乾淨的藍色突顯關鍵資訊。',
    AppThemeId.aurora => '偏冷調的青綠玻璃介面，層次更柔和，也更通透。',
  };

  @override
  String relativeTime(DateTime dt) {
    return formatRelativeTime(
      dt,
      now: '剛剛',
      minute: (value) => '$value分鐘前',
      hour: (value) => '$value小時前',
      day: (value) => '$value天前',
      month: (value) => '$value個月前',
      year: (value) => '$value年前',
    );
  }

  @override
  String readTime(int minutes) => '$minutes 分鐘';
}
