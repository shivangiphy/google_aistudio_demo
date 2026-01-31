# Quantify Deployment & Development Guide

This document outlines the steps to run Quantify locally for development or deploy it as a high-performance mobile application/PWA.

## 1. Local Development (Web App)


To run this project on your machine for development or testing:

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version recommended) installed.

### Setup Instructions
1. **Prepare the Directory**: Create a folder for the project and copy all the provided files into it.
2. **Install Core Dependencies**:
   Open your terminal in the project folder and run:
   ```bash
   npm init -y
   npm install react react-dom recharts
   npm install -D @types/react @types/react-dom vite
   ```
3. **Configure Entry Point**: 
   Open `index.html` and add the following line just before the closing `</body>` tag to enable Vite's module loading:
   ```html
   <script type="module" src="/index.tsx"></script>
   ```
4. **Launch the App**:
   Run the following command to start the Vite development server:
   ```bash
   npx vite
   ```
5. **View in Browser**: Open `http://localhost:5173` (or the URL provided in your terminal).

---

## 2. Native Mobile App (via Capacitor)

Capacitor is the recommended way to wrap this React application into a native container for iOS and Android.

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
1. **Build the Web Project**: `npm run build`
2. **Copy to Native Platforms**: `npx cap copy`
3. **Open in IDE**: 
   - `npx cap open android` (Android Studio)
   - `npx cap open ios` (Xcode)

---

## 3. Progressive Web App (PWA) - BUILT-IN

Quantify includes standard PWA support via `manifest.json` and `sw.js`.

### Installation
- **iOS (Safari)**: Tap "Share" -> "Add to Home Screen".
- **Android (Chrome)**: Tap the menu -> "Install App".

### Persistence Note
Quantify uses `sql.js` (SQLite WASM) with `LocalStorage` persistence. Data is saved locally in your browser/container environment. Ensure you use the same browser to maintain access to your data.

---

## 4. Native Polish (UI/UX)

- **Status Bar**: Use `@capacitor/status-bar` to set the bar color to `#101f22`.
- **Splash Screens**: Use `@capacitor/assets` to generate splash screens.
- **Safe Areas**: The UI uses Tailwind's spacing; for native apps, ensure the `viewport-fit=cover` meta tag is present (included by default).