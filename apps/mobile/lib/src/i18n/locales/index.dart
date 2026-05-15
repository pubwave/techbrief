import '../app_locale.dart';
import '../app_strings.dart';
import 'de.dart';
import 'en.dart';
import 'es.dart';
import 'fr.dart';
import 'ja.dart';
import 'ko.dart';
import 'pt.dart';
import 'zh_cn.dart';
import 'zh_tw.dart';

final Map<AppLocale, AppStrings> _catalog = <AppLocale, AppStrings>{
  AppLocale.en: enStrings,
  AppLocale.zhCn: zhCnStrings,
  AppLocale.zhTw: zhTwStrings,
  AppLocale.ja: jaStrings,
  AppLocale.ko: koStrings,
  AppLocale.es: esStrings,
  AppLocale.fr: frStrings,
  AppLocale.de: deStrings,
  AppLocale.pt: ptStrings,
};

AppStrings resolveAppStrings(String? languageCode) {
  return _catalog[AppLocale.fromCode(languageCode)] ?? _catalog[AppLocale.en]!;
}
