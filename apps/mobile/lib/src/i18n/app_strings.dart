import 'package:flutter/widgets.dart';

import '../theme/palette.dart';
import 'locales/de.dart';
import 'locales/en.dart';
import 'locales/es.dart';
import 'locales/fr.dart';
import 'locales/ja.dart';
import 'locales/ko.dart';
import 'locales/pt.dart';
import 'locales/zh_cn.dart';
import 'locales/zh_tw.dart';

String formatRelativeTime(
  DateTime dt, {
  required String now,
  required String Function(int value) minute,
  required String Function(int value) hour,
  required String Function(int value) day,
  required String Function(int value) month,
  required String Function(int value) year,
}) {
  final diff = DateTime.now().difference(dt);
  if (diff.inMinutes < 1) return now;
  if (diff.inMinutes < 60) return minute(diff.inMinutes);
  if (diff.inHours < 24) return hour(diff.inHours);
  if (diff.inDays < 30) return day(diff.inDays);

  final months = diff.inDays ~/ 30;
  if (months < 12) return month(months);
  return year(months ~/ 12);
}

/// Mobile string contract — keys mirror web LocaleMessages where applicable.
abstract class AppStrings {
  const AppStrings();

  static AppStrings of(BuildContext context) {
    final locale = Localizations.localeOf(context);
    switch (locale.languageCode) {
      case 'zh':
        final script = locale.scriptCode ?? '';
        final region = locale.countryCode ?? '';
        if (script == 'Hant' ||
            region == 'TW' ||
            region == 'HK' ||
            region == 'MO') {
          return const ZhTwStrings();
        }
        return const ZhCnStrings();
      case 'ja':
        return const JaStrings();
      case 'ko':
        return const KoStrings();
      case 'es':
        return const EsStrings();
      case 'fr':
        return const FrStrings();
      case 'de':
        return const DeStrings();
      case 'pt':
        return const PtStrings();
      default:
        return const EnStrings();
    }
  }

  // ── App chrome ──────────────────────────────────────────────────────────────
  String get appName; // web: menu
  String get signalReader; // web: signalReader

  // ── Feed ────────────────────────────────────────────────────────────────────
  String get tabFeed; // web: home
  String get tabSettings; // web: settings
  String get channelAll; // web: allFilter
  String get channelTechNews; // web: techNewsFilter
  String get channelIndieDev; // web: indieDevFilter
  String get searchPlaceholder; // web: searchPlaceholder
  String get nextSyncLabel; // web: nextSyncLabel
  String get syncingData; // web: syncingData
  String get emptyFeed; // web: emptyFeed
  String get loadFeedError; // web: loadFeedError
  String get loadingMore; // web: loadingMore
  String get showingCached; // mobile-only fallback notice
  String itemsCount(int count); // web: itemsCount

  // ── Article detail ──────────────────────────────────────────────────────────
  String get translationInProgress; // web: translationInProgress
  String get translationFailed; // mobile-only
  String get openSourceLink; // web: openSourceLink
  String get previousArticle; // web: previousArticleLabel
  String get nextArticle; // web: nextArticleLabel

  // ── Settings ────────────────────────────────────────────────────────────────
  String get settings; // web: settings
  String get workspaceSettings; // web: workspaceSettings
  String get workspaceSettingsDesc; // web: workspaceSettingsDescription
  String get theme; // web: theme
  String get themeDescription; // web: themeDescription
  String get active; // web: active
  String get apply; // web: apply

  // ── Theme labels (mirrors web themeLabels / themeSummaries) ─────────────────
  String themeLabel(AppThemeId id);
  String themeSummary(AppThemeId id);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  String relativeTime(DateTime dt);
  String readTime(int minutes);
}
