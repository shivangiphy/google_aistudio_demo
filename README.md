# Quantify Deployment Guide

This document outlines the steps to deploy **Quantify** as a high-performance mobile application for Android and iOS, or as a Progressive Web App (PWA).

## 1. Native Mobile App (via Capacitor)

Capacitor is the recommended way to wrap this React application into a native container.

### Prerequisites
- Node.js installed.
- **Android**: Android Studio installed.
- **iOS**: Xcode installed (requires macOS).

### Setup Steps
1. **Install Capacitor CLI**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```
2. **Initialize Capacitor**:
   ```bash
   npx cap init Quantify com.yourname.quantify --web-dir dist
   ```
3. **Add Native Platforms**:
   ```bash
   # For Android
   npm install @capacitor/android
   npx cap add android

   # For iOS
   npm install @capacitor/ios
   npx cap add ios
   ```

### Build & Sync Process
Every time you update your code:
1. **Build the Web Project**:
   ```bash
   npm run build
   ```
2. **Copy to Native Platforms**:
   ```bash
   npx cap copy
   ```
3. **Open in IDE**:
   ```bash
   npx cap open android  # Opens Android Studio
   npx cap open ios      # Opens Xcode
   ```

### Storage Note
Quantify currently uses `sql.js` (SQLite WASM) with `LocalStorage` persistence. For production mobile apps with high data volume, consider migrating `db.ts` to use the `@capacitor-community/sqlite` plugin for native file system access.

---

## 2. Progressive Web App (PWA) - BUILT-IN

Quantify now includes built-in PWA support via `manifest.json` and `sw.js`.

### Installation
1. **On iOS (Safari)**: Tap the Share button and select "Add to Home Screen".
2. **On Android (Chrome)**: Tap the three-dot menu and select "Install App" or "Add to Home Screen".

### Key Features
- **Offline Mode**: The Service Worker caches essential assets and the SQLite engine.
- **Standalone Experience**: Launches without browser chrome for a native look.
- **Theming**: Integrated theme-color matching the dark UI.

### Development Note
Ensure your hosting environment serves the application over **HTTPS**, as Service Workers are only active in secure contexts (except for localhost).

---

## 3. Native Polish (UI/UX)

To make Quantify feel native:
- **Status Bar**: Use `@capacitor/status-bar` to set the bar color to `#101f22`.
- **Splash Screens**: Use `@capacitor/assets` to generate splash screens from a single icon template.
- **Safe Areas**: Ensure the UI respects the iPhone notch and bottom home indicator using Tailwind's `pb-safe` classes.
