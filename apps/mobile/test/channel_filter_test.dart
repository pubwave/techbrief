import 'package:flutter_test/flutter_test.dart';
import 'package:techbrief_mobile/src/model/channel_filter.dart';

void main() {
  group('ChannelFilter', () {
    test('all has no api value (no category filter)', () {
      expect(ChannelFilter.all.apiValue, isNull);
      expect(ChannelFilter.all.label, 'All');
    });

    test('tech news and indie dev map to their api categories', () {
      expect(ChannelFilter.techNews.apiValue, 'tech-news');
      expect(ChannelFilter.indieDev.apiValue, 'indie-dev');
    });

    test('exposes exactly three channels', () {
      expect(ChannelFilter.values, hasLength(3));
    });
  });
}
