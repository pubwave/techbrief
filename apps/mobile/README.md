# TechBrief Mobile

The TechBrief reader app for iPhone and Android. It shows the same articles,
AI summaries, and translations as the web reader — on your phone.

## Easiest way to run it

The app reads from the TechBrief running on your computer, so start that first
(`techbrief` on your computer). Then, with your phone on the same Wi‑Fi:

```bash
techbrief mobile run ios       # or: android
```

That installs the app and connects it to your computer automatically.

## First launch on iPhone

iOS asks for permission to find devices on your local network. Tap **Allow** —
the app needs it to reach the TechBrief on your computer. If the list looks
empty the very first time, wait a second; it loads on its own once permission is
granted.

## Running from source (for developers)

This is a standard Flutter app. You need the
[Flutter SDK](https://docs.flutter.dev/get-started/install).

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://<your-computer-ip>:9541
```

Use your computer's local IP (not `127.0.0.1`) so the phone can reach it over
Wi‑Fi.
