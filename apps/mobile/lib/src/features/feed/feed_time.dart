import '../../i18n/index.dart';

String channelLabelForContentType(String contentType) {
  return contentType == 'indie-dev' ? 'Indie Developers' : 'Companies + Media';
}

String formatFeedTimestamp(String publishedAt, AppStrings strings) {
  final timestamp = DateTime.tryParse(publishedAt)?.toUtc();
  if (timestamp == null) {
    return publishedAt;
  }

  final now = DateTime.now().toUtc();
  final difference = now.difference(timestamp);

  if (difference.inMinutes < 1) {
    return strings.justNow;
  }
  if (difference.inMinutes < 60) {
    return strings.minutesAgo(difference.inMinutes);
  }
  if (difference.inHours < 24) {
    return strings.hoursAgo(difference.inHours);
  }
  if (difference.inDays < 7) {
    return strings.daysAgo(difference.inDays);
  }

  final month = timestamp.month.toString().padLeft(2, '0');
  final day = timestamp.day.toString().padLeft(2, '0');
  return '${timestamp.year}-$month-$day';
}
