enum ChannelFilter {
  all(null, 'All'),
  techNews('tech-news', 'Tech News'),
  indieDev('indie-dev', 'Indie Dev');

  const ChannelFilter(this.apiValue, this.label);

  final String? apiValue;
  final String label;
}
