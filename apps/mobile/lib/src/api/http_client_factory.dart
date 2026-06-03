import 'dart:io';

import 'package:cupertino_http/cupertino_http.dart';
import 'package:http/http.dart' as http;

/// Builds the HTTP client used for all API calls.
///
/// On Apple platforms we route through NSURLSession (via `cupertino_http`)
/// instead of the default `dart:io` socket client. This matters for reaching a
/// server on the local network (e.g. a dev machine on 192.168.x.x): iOS gates
/// local-network access behind a permission prompt, and only NSURLSession
/// integrates with that gate — it holds the request while the prompt is shown
/// and proceeds once the user allows it. The raw `dart:io` socket instead fails
/// immediately ("No route to host, errno 65") on first launch and isn't retried
/// in-session, which is why the feed only loaded after a cold restart.
http.Client createHttpClient() {
  if (Platform.isIOS || Platform.isMacOS) {
    return CupertinoClient.defaultSessionConfiguration();
  }
  return http.Client();
}
