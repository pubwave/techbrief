import 'package:flutter/material.dart';

import 'features/feed/feed_root.dart';
import 'theme/app_theme.dart';

class TechBriefApp extends StatefulWidget {
  const TechBriefApp({super.key});

  @override
  State<TechBriefApp> createState() => _TechBriefAppState();
}

class _TechBriefAppState extends State<TechBriefApp> {
  AppThemeId _themeId = AppThemeId.currentTheme;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TechBrief',
      debugShowCheckedModeBanner: false,
      theme: buildTechBriefTheme(_themeId),
      home: FeedRoot(
        onThemeChanged: (themeId) => setState(() => _themeId = themeId),
      ),
    );
  }
}
