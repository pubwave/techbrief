import 'dart:async';

import 'package:flutter/material.dart';

import '../../i18n/app_strings.dart';
import '../../theme/palette.dart';
import '../feed_controller.dart';

/// A thin status row under the search box: counts down to the next scheduled
/// sync and, once due, shows an animated "syncing data" indicator until the
/// server pushes new articles (or a grace window elapses for a no-op sync).
class SyncStatusBar extends StatefulWidget {
  const SyncStatusBar({
    super.key,
    required this.controller,
    required this.palette,
  });

  final FeedController controller;
  final AppPalette palette;

  @override
  State<SyncStatusBar> createState() => _SyncStatusBarState();
}

class _SyncStatusBarState extends State<SyncStatusBar> {
  static const _defaultInterval = Duration(minutes: 15);
  static const _graceWindow = Duration(seconds: 90);

  Duration _interval = _defaultInterval;
  DateTime? _anchor;
  DateTime? _lastSeenSignal;
  bool _ready = false;
  bool _syncing = false;
  Timer? _ticker;
  Timer? _grace;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onControllerChanged);
    _load();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  Future<void> _load() async {
    final info = await widget.controller.fetchScheduleInfo();
    if (!mounted) return;
    setState(() {
      _interval = info.interval;
      _anchor = info.lastSyncAt ?? DateTime.now();
      _lastSeenSignal = widget.controller.lastSyncSignalAt;
      _ready = true;
    });
  }

  void _onControllerChanged() {
    final signal = widget.controller.lastSyncSignalAt;
    if (signal != null && signal != _lastSeenSignal) {
      _lastSeenSignal = signal;
      _grace?.cancel();
      if (!mounted) return;
      setState(() {
        _syncing = false;
        _anchor = DateTime.now();
      });
      // Re-read the schedule so a mid-session interval change and the real last
      // sync time are reflected on the next cycle.
      _load();
    }
  }

  void _tick() {
    if (!mounted || !_ready) return;
    if (_remaining() <= Duration.zero && !_syncing) {
      setState(() => _syncing = true);
      _grace?.cancel();
      _grace = Timer(_graceWindow, () {
        if (!mounted) return;
        setState(() => _syncing = false);
        // No sync event arrived within the grace window; re-read the schedule
        // and restart the countdown.
        _load();
      });
    } else {
      setState(() {});
    }
  }

  Duration _remaining() {
    final anchor = _anchor;
    if (anchor == null) return Duration.zero;
    final diff = anchor.add(_interval).difference(DateTime.now());
    return diff.isNegative ? Duration.zero : diff;
  }

  String _format(Duration d) {
    final mm = d.inMinutes.toString().padLeft(2, '0');
    final ss = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onControllerChanged);
    _ticker?.cancel();
    _grace?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) return const SizedBox.shrink();
    final s = AppStrings.of(context);
    final p = widget.palette;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: _syncing
          ? Row(
              children: [
                SizedBox(
                  width: 11,
                  height: 11,
                  child: CircularProgressIndicator(strokeWidth: 1.5, color: p.accent),
                ),
                const SizedBox(width: 8),
                Text(
                  s.syncingData,
                  style: TextStyle(fontSize: 11, color: p.accent, fontWeight: FontWeight.w500),
                ),
              ],
            )
          : Text(
              '${s.nextSyncLabel} ${_format(_remaining())}',
              style: TextStyle(fontSize: 11, color: p.textMuted, fontWeight: FontWeight.w500),
            ),
    );
  }
}
