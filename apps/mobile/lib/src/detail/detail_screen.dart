import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../feed/feed_controller.dart';
import '../model/feed_article.dart';
import '../reader/reader_webview.dart';
import '../theme/palette.dart';
import 'widgets/detail_toolbar.dart';
import 'widgets/translation_bar.dart';

class DetailScreen extends StatefulWidget {
  const DetailScreen({
    super.key,
    required this.article,
    required this.palette,
    required this.feedController,
  });

  final FeedArticle article;
  final AppPalette palette;
  final FeedController feedController;

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  late FeedArticle _article;
  // Read progress, driven by the WebView's native scroll (reported via
  // onScrollProgress). Only the progress bar listens, so the body never relays.
  final ValueNotifier<double> _progress = ValueNotifier<double>(0);

  AppPalette get _p => widget.palette;

  @override
  void initState() {
    super.initState();
    _article = widget.article;
    widget.feedController.addListener(_onControllerChanged);
    widget.feedController.setSelectedId(_article.id);
    // Read back immediately — setSelectedId calls _rebalanceQueue synchronously,
    // which sets isTranslating: true, so the first build already shows the translation bar.
    final updated = widget.feedController.items
        .where((a) => a.id == _article.id)
        .firstOrNull;
    if (updated != null) _article = updated;
  }

  void _onControllerChanged() {
    final updated = widget.feedController.items
        .where((a) => a.id == _article.id)
        .firstOrNull;
    if (updated != null && mounted) {
      setState(() => _article = updated);
    }
  }

  @override
  void dispose() {
    widget.feedController.removeListener(_onControllerChanged);
    _progress.dispose();
    super.dispose();
  }

  // DetailDocumentInput payload: the reader assembles the full editor document
  // (title heading + colored tags + metadata + body) from this, the same way the
  // web app does, so everything renders inside one natively-scrolling WebView.
  Map<String, dynamic> _buildPayload() {
    final p = _p;
    final source = _sourceColor(_article.sourceName);
    // Time/read-time live in the fixed toolbar; the in-reader meta keeps only the
    // author to avoid showing the timestamp twice.
    final metadata = <String>[
      ?_article.author,
    ];
    final tiptap = _article.displayTiptapJson;
    final body = _article.displayBody;
    return <String, dynamic>{
      'title': _article.displayTitle,
      'metadata': metadata,
      'metadataTags': <Map<String, dynamic>>[
        {
          'label': _article.channelLabel,
          'tone': 'primary',
          'variant': 'solid',
          'size': 'md',
          'backgroundColor': _cssColor(p.tagChannelBg),
          'textColor': _cssColor(p.tagChannelText),
          'borderColor': _cssColor(p.tagChannelBorder),
        },
        {
          'label': _article.sourceName,
          'tone': 'primary',
          'variant': 'solid',
          'size': 'md',
          'backgroundColor': _cssColor(source.withValues(alpha: 0.12)),
          'textColor': _cssColor(source),
          'borderColor': _cssColor(source.withValues(alpha: 0.3)),
        },
      ],
      'bodyDocument': ?tiptap,
      if (body.isNotEmpty) 'bodyFallback': body,
    };
  }

  @override
  Widget build(BuildContext context) {
    final p = _p;

    return Scaffold(
      backgroundColor: p.background,
      // bottom: false lets the WebView reach the physical screen edge; the reader
      // adds its own padding-bottom: env(safe-area-inset-bottom) so the last line
      // clears the home indicator instead of being cut by a SafeArea black strip.
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Progress bar — only this rebuilds on scroll (via ValueListenable).
            SizedBox(
              height: 2,
              child: ValueListenableBuilder<double>(
                valueListenable: _progress,
                builder: (_, value, _) => LinearProgressIndicator(
                  value: value,
                  backgroundColor: p.border,
                  valueColor: AlwaysStoppedAnimation<Color>(p.accent),
                  minHeight: 2,
                ),
              ),
            ),

            // Toolbar
            DetailToolbar(
              article: _article,
              palette: p,
              onBack: () => Navigator.of(context).pop(),
              onOpenExternal: _openExternal,
            ),

            // Translation bar
            TranslationBar(
              palette: p,
              isTranslating: _article.isTranslating,
              error: _article.translationError,
            ),

            // Body — the WebView owns scrolling (full article, title included),
            // so there is no Flutter scroll view wrapping it and therefore no
            // platform-view/host compositing desync (the cause of text ghosting).
            Expanded(
              child: ReaderWebView(
                content: _buildPayload(),
                theme: p.toReaderTheme(),
                onScrollProgress: (value) => _progress.value = value,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openExternal() async {
    final url = Uri.tryParse(_article.sourceUrl ?? _article.originalUrl);
    if (url != null) await launchUrl(url, mode: LaunchMode.externalApplication);
  }
}

// Source chip accent, hash-matched to the same palette the SourceAvatar/tag chips
// use, so the in-reader source tag keeps its familiar color.
const List<Color> _sourceColors = <Color>[
  Color(0xFF0284C7),
  Color(0xFF7C3AED),
  Color(0xFF059669),
  Color(0xFFDC2626),
  Color(0xFFD97706),
  Color(0xFF2563EB),
  Color(0xFF9333EA),
  Color(0xFF16A34A),
  Color(0xFFB91C1C),
  Color(0xFF0891B2),
];

Color _sourceColor(String name) {
  var hash = 0;
  for (final ch in name.codeUnits) {
    hash = (hash * 31 + ch) & 0x7FFFFFFF;
  }
  return _sourceColors[hash % _sourceColors.length];
}

String _hex2(double channel) =>
    (channel * 255).round().clamp(0, 255).toRadixString(16).padLeft(2, '0');

// #RRGGBBAA so tag alpha (e.g. 0.12 backgrounds) survives the JSON round-trip
// into the editor's tag mark colors.
String _cssColor(Color c) => '#${_hex2(c.r)}${_hex2(c.g)}${_hex2(c.b)}${_hex2(c.a)}';
