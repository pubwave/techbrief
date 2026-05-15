import 'package:flutter/material.dart';

import '../../i18n/index.dart';
import '../../theme/app_theme.dart';
import 'feed_settings.dart';
import 'widgets/theme_option_card.dart';

class FeedSettingsPage extends StatefulWidget {
  const FeedSettingsPage({
    super.key,
    required this.initialSettings,
    required this.isSyncing,
    required this.statusMessage,
    required this.onSave,
    required this.onSync,
    required this.currentTheme,
    required this.onThemeSelected,
    required this.strings,
  });

  final FeedSettings initialSettings;
  final bool isSyncing;
  final String? statusMessage;
  final Future<void> Function(FeedSettings settings) onSave;
  final Future<void> Function() onSync;
  final AppThemeId currentTheme;
  final ValueChanged<AppThemeId> onThemeSelected;
  final AppStrings strings;

  @override
  State<FeedSettingsPage> createState() => _FeedSettingsPageState();
}

class _FeedSettingsPageState extends State<FeedSettingsPage> {
  late final TextEditingController _apiBaseUrlController;

  @override
  void initState() {
    super.initState();
    _apiBaseUrlController = TextEditingController(
      text: widget.initialSettings.apiBaseUrl,
    );
  }

  @override
  void didUpdateWidget(covariant FeedSettingsPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialSettings.apiBaseUrl !=
            widget.initialSettings.apiBaseUrl &&
        _apiBaseUrlController.text != widget.initialSettings.apiBaseUrl) {
      _apiBaseUrlController.text = widget.initialSettings.apiBaseUrl;
    }
  }

  @override
  void dispose() {
    _apiBaseUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          widget.strings.settingsTitle,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 8),
        Text(
          widget.strings.settingsDescription,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 18),
        Text(
          widget.strings.apiBaseUrl,
          style: Theme.of(
            context,
          ).textTheme.labelLarge?.copyWith(color: colors.textPrimary),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _apiBaseUrlController,
          keyboardType: TextInputType.url,
          autocorrect: false,
          decoration: InputDecoration(hintText: widget.strings.apiBaseUrlHint),
        ),
        const SizedBox(height: 10),
        Text(
          widget.strings.apiBaseUrlHelp,
          style: Theme.of(context).textTheme.labelSmall,
        ),
        const SizedBox(height: 18),
        Row(
          children: <Widget>[
            Expanded(
              child: _ActionButton(
                label: widget.strings.saveServer,
                onPressed: () {
                  widget.onSave(
                    FeedSettings(
                      apiBaseUrl: _apiBaseUrlController.text.trim(),
                      themeId: widget.currentTheme,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ActionButton(
                label: widget.isSyncing
                    ? widget.strings.syncingNow
                    : widget.strings.syncNow,
                onPressed: widget.isSyncing
                    ? null
                    : () {
                        widget.onSync();
                      },
                accent: true,
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        Text(
          widget.strings.themeTitle,
          style: Theme.of(
            context,
          ).textTheme.labelLarge?.copyWith(color: colors.textPrimary),
        ),
        const SizedBox(height: 8),
        Text(
          widget.strings.themeDescription,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 12),
        Column(
          children: appThemeOptions
              .map(
                (option) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ThemeOptionCard(
                    onTap: () => widget.onThemeSelected(option.id),
                    option: option,
                    selected: option.id == widget.currentTheme,
                    strings: widget.strings,
                  ),
                ),
              )
              .toList(),
        ),
        if (widget.statusMessage != null) ...<Widget>[
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.surfaceCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: colors.border),
            ),
            child: Text(
              widget.statusMessage!,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.onPressed,
    this.accent = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<TechBriefColors>()!;

    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onPressed,
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: accent ? colors.accent : colors.surfaceCardAlt,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: accent ? Colors.transparent : colors.border,
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: accent ? colors.accentInk : colors.textPrimary,
          ),
        ),
      ),
    );
  }
}
