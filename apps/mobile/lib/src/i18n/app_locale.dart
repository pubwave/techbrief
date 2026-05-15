enum AppLocale {
  en('en'),
  zhCn('zh-CN'),
  zhTw('zh-TW'),
  ja('ja'),
  ko('ko'),
  es('es'),
  fr('fr'),
  de('de'),
  pt('pt');

  const AppLocale(this.code);

  final String code;

  static AppLocale fromCode(String? code) {
    return AppLocale.values.firstWhere(
      (locale) => locale.code == code,
      orElse: () => AppLocale.en,
    );
  }
}
