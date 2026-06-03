import 'package:flutter/material.dart';

import 'src/app.dart';
import 'src/storage/settings_store.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(TechBriefApp(store: SettingsStore()));
}
