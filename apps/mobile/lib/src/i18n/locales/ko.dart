import '../../theme/palette.dart';
import '../app_strings.dart';

class KoStrings extends AppStrings {
  const KoStrings();

  @override
  String get appName => 'Tech Brief';
  @override
  String get signalReader => '기술 뉴스 큐레이션';

  @override
  String get tabFeed => '홈';
  @override
  String get tabSettings => '설정';
  @override
  String get channelAll => '전체';
  @override
  String get channelTechNews => '테크 미디어';
  @override
  String get channelIndieDev => '인디 개발';
  @override
  String get searchPlaceholder => '기사와 소스를 검색...';
  @override
  String get nextSyncLabel => '다음 동기화까지';
  @override
  String get syncingData => '데이터 동기화 중';
  @override
  String get emptyFeed => '현재 목록이 비어 있습니다.';
  @override
  String get loadFeedError => '피드를 불러올 수 없습니다.';
  @override
  String get loadingMore => '더 불러오는 중…';
  @override
  String get showingCached => '캐시된 기사를 표시 중입니다.';
  @override
  String itemsCount(int count) => '$count개';

  @override
  String get translationInProgress => '번역 중';
  @override
  String get translationFailed => '번역 실패';
  @override
  String get openSourceLink => '원문 링크 열기';
  @override
  String get previousArticle => '이전 기사';
  @override
  String get nextArticle => '다음 기사';

  @override
  String get settings => '설정';
  @override
  String get workspaceSettings => '화면 설정';
  @override
  String get workspaceSettingsDesc => '리더 전체에 사용할 테마를 선택합니다.';
  @override
  String get theme => '테마';
  @override
  String get themeDescription => '테마는 즉시 적용되며 이 기기에 저장됩니다.';
  @override
  String get active => '사용 중';
  @override
  String get apply => '적용';

  @override
  String themeLabel(AppThemeId id) => switch (id) {
    AppThemeId.current => '딥 시그널',
    AppThemeId.dawn => '모닝 에디션',
    AppThemeId.aurora => '오로라 글래스',
  };

  @override
  String themeSummary(AppThemeId id) => switch (id) {
    AppThemeId.current => '시안 하이라이트와 더 선명한 레이어를 갖춘 밝은 딥블루 리딩 화면입니다.',
    AppThemeId.dawn => '종이 같은 따뜻한 밝기 위에 깔끔한 블루 포인트를 얹은 작업 화면입니다.',
    AppThemeId.aurora => '청록 계열 유리 질감에 더 부드러운 깊이와 투명감을 더한 화면입니다.',
  };

  @override
  String relativeTime(DateTime dt) {
    return formatRelativeTime(
      dt,
      now: '방금 전',
      minute: (value) => '$value분 전',
      hour: (value) => '$value시간 전',
      day: (value) => '$value일 전',
      month: (value) => '$value개월 전',
      year: (value) => '$value년 전',
    );
  }

  @override
  String readTime(int minutes) => '$minutes분';
}
