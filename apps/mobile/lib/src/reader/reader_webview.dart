import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class ReaderWebView extends StatefulWidget {
  const ReaderWebView({
    super.key,
    required this.content,
    required this.theme,
    this.onScrollProgress,
  });

  // DetailDocumentInput payload (title + metadata + tags + body). The reader
  // assembles the full editor document from it.
  final Map<String, dynamic> content;
  final Map<String, dynamic> theme;
  // Reports read progress 0..1 as the WebView scrolls natively. The WebView owns
  // scrolling (it is not nested in a Flutter scroll view), which avoids the
  // platform-view/host compositing desync that caused text ghosting on scroll.
  final void Function(double progress)? onScrollProgress;

  @override
  State<ReaderWebView> createState() => _ReaderWebViewState();
}

class _ReaderWebViewState extends State<ReaderWebView> {
  InAppWebViewController? _ctrl;
  bool _loaded = false;

  @override
  void didUpdateWidget(covariant ReaderWebView old) {
    super.didUpdateWidget(old);
    if (!_loaded) return;
    if (old.content != widget.content || old.theme != widget.theme) {
      _setContent();
    }
  }

  @override
  Widget build(BuildContext context) {
    return InAppWebView(
      initialFile: 'assets/reader/reader.html',
      initialSettings: InAppWebViewSettings(
        transparentBackground: true,
        allowFileAccessFromFileURLs: true,
        allowUniversalAccessFromFileURLs: true,
        javaScriptEnabled: true,
        // The WebView scrolls its own content natively; only horizontal scroll
        // is suppressed.
        disableHorizontalScroll: true,
        disableVerticalScroll: false,
      ),
      onWebViewCreated: (c) {
        _ctrl = c;
        c.addJavaScriptHandler(
          handlerName: 'TechBrief',
          callback: (args) {
            if (args.isNotEmpty) _onMessage(args.first.toString());
          },
        );
      },
      onLoadStop: (_, url) async {
        _loaded = true;
        await _setContent();
        await _installScrollRelay();
      },
    );
  }

  Future<void> _setContent() async {
    await _ctrl?.evaluateJavascript(
      source:
          'window.setContent(${jsonEncode(jsonEncode(widget.content))},${jsonEncode(jsonEncode(widget.theme))})',
    );
  }

  Future<void> _installScrollRelay() async {
    if (widget.onScrollProgress == null) return;
    await _ctrl?.evaluateJavascript(
      source: r'''
      (function(){
        if(window.__tbSR) return;
        window.__tbSR=true;
        var raf=0;
        function report(){
          raf=0;
          var doc=document.documentElement;
          var max=doc.scrollHeight - doc.clientHeight;
          var p=max>0?(doc.scrollTop||document.body.scrollTop||0)/max:0;
          if(p<0)p=0; if(p>1)p=1;
          if(window.flutter_inappwebview){
            window.flutter_inappwebview.callHandler('TechBrief',
              JSON.stringify({type:'progress',progress:p}));
          }
        }
        function onScroll(){ if(raf) return; raf=requestAnimationFrame(report); }
        window.addEventListener('scroll', onScroll, {passive:true});
      })();
      ''',
    );
  }

  void _onMessage(String raw) {
    try {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      if (data['type'] == 'progress') {
        final p = (data['progress'] as num?)?.toDouble() ?? 0;
        widget.onScrollProgress?.call(p.clamp(0.0, 1.0));
      }
    } catch (_) {}
  }
}
