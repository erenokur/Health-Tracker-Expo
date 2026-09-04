# Health Tracker (Mobile App)

A React Native / Expo application for tracking blood pressure and medications. It features a local SQLite database, home screen widgets, scheduled local notifications, and seamless synchronization with its companion Wear OS app.

## Features

- **Blood Pressure Tracking**: Log systolic, diastolic, and pulse readings.
- **Medication Tracking**: Log medication intake (fasting / fed states).
- **Home Screen Widget**: View your latest blood pressure reading directly from your Android home screen and quick-add new readings.
- **Reminders**: Schedule weekly local notifications for taking measurements or medications.
- **Wear OS Integration**: Instantly receive and save logs sent from your paired Wear OS smartwatch via the Wearable Data Layer API.
- **Bilingual**: Fully supports English and Turkish out of the box.

## Getting Started

### Prerequisites

- Node.js 20+
- Java (JDK 17)
- Android SDK & Android Studio (for local compilation)
- Expo CLI

### Local Setup & Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate native Android code (required before first run or after modifying `app.json`):
   ```bash
   npx expo prebuild --platform android --clean
   ```
3. Run in Debug mode on a connected device/emulator:
   ```bash
   npx expo run:android
   ```

### Building a Release APK

To create a production-ready APK for your live device:
```bash
npx expo run:android --variant release
```
*Note: Make sure to check your phone's battery optimization settings (set to "Unrestricted") for the app if you want scheduled notifications to reliably work when the app is swiped away from memory.*

## Continuous Integration (CI/CD)

The repository includes a GitHub Actions workflow (`.github/workflows/build-apk.yml`). 
Whenever code is pushed to the `release` branch, it automatically builds a Release APK and attaches it to a new GitHub Release.
