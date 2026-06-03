import '../../theme/palette.dart';
import '../app_strings.dart';

class ZhCnStrings extends AppStrings {
  const ZhCnStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => '精选速报';

  @override
  String get tabFeed => '首页';
  @override
  String get tabSettings => '设置';
  @override
  String get channelAll => '全部';
  @override
  String get channelTechNews => '科技媒体';
  @override
  String get channelIndieDev => '独立开发';
  @override
  String get searchPlaceholder => '搜索文章、来源……';
  @override
  String get nextSyncLabel => '下次同步';
  @override
  String get syncingData => '正在同步数据';
  @override
  String get emptyFeed => '当前列表为空';
  @override
  String get loadFeedError => '无法加载信息流。';
  @override
  String get loadingMore => '正在加载更多…';
  @override
  String get showingCached => '显示缓存内容。';
  @override
  String itemsCount(int count) => '$count 条';

  @override
  String get translationInProgress => '正在翻译';
  @override
  String get translationFailed => '翻译失败';
  @override
  String get openSourceLink => '打开源链接';
  @override
  String get previousArticle => '上一篇';
  @override
  String get nextArticle => '下一篇';

  @override
  String get settings => '设置';
  @override
  String get workspaceSettings => '外观设置';
  @override
  String get workspaceSettingsDesc => '选择阅读器使用的界面主题。';
  @override
  String get theme => '主题';
  @override
  String get themeDescription => '主题会立即生效，并保存在这台设备上。';
  @override
  String get active => '当前';
  @override
  String get apply => '应用';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => '深海信号',
    AppThemeId.dawn => '晨光纸页',
    AppThemeId.aurora => '极光玻璃',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current => '更明亮的深海蓝阅读界面，保留青色高亮和清晰层次。',
    AppThemeId.dawn => '带纸页质感的暖白界面，用干净的蓝色强调关键信息。',
    AppThemeId.aurora => '偏冷调的青绿玻璃界面，层次更柔和，也更通透。',
  };

  @override
  String relativeTime(DateTime dt) {
    return formatRelativeTime(
      dt,
      now: '刚刚',
      minute: (value) => '$value分钟前',
      hour: (value) => '$value小时前',
      day: (value) => '$value天前',
      month: (value) => '$value个月前',
      year: (value) => '$value年前',
    );
  }

  @override
  String readTime(int minutes) => '$minutes 分钟';
}
