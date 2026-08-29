# Health Tracker — Expo App (Phase 1)

Phase 1 of the migration plan: Expo + expo-router + expo-sqlite, full local
feature parity with the original Kivy `main.py` — no network/sync yet
(that's Phase 4).

## Kurulum ve Çalıştırma (Install & Run)

Requires **Node.js 20+** (Node 22 or 24 recommended) and the **Expo Go** app
on your phone (SDK 54).

```bash
npx expo install expo-notifications
npm install --legacy-peer-deps
npx expo start -c
```

Scan the printed QR code with Expo Go (Android/iOS), or press `a` for an
Android emulator / `i` for iOS simulator. The `-c` flag clears Metro's
bundler cache — worth doing on first run or after any dependency change.

If `npm install` fails with an `ERESOLVE` peer-dependency error, retry with:

```bash
npm install --legacy-peer-deps
```

**If dependency versions ever drift out of sync with the installed Expo
SDK** (e.g. after Expo Go auto-updates on your phone to a newer SDK than
the project targets), run:

```bash
npx expo install --fix
npx expo-doctor
```

`expo-doctor` is the most reliable way to catch version mismatches — trust
its "expected version" output over any versions hard-coded here, since it
checks against Expo's live compatibility table.

### Troubleshooting things we've actually hit

- **"Project is incompatible with this version of Expo Go" / SDK mismatch**
  → Expo Go on your phone auto-updates to the latest SDK from the Play/App
  Store. Bump this project's `expo` version to match (`npx expo install
expo@^<sdk>` then `npx expo install --fix`), since downgrading Expo Go
  itself is not practical.
- **"Cannot find module 'babel-preset-expo'"** → it's a separate package,
  not bundled with `expo`. Install explicitly:
  `npm install --save-dev babel-preset-expo@~<sdk>.0.0` (must match your
  SDK's major version — check with `npx expo-doctor`).
- **"[runtime not ready]: SyntaxError: private properties are not
  supported"** → almost always a stray dependency version mismatch (in our
  case, `babel-preset-expo` had drifted to a much newer major version than
  the SDK). Run `npx expo-doctor` first before touching any code — it will
  usually name the exact mismatched package.

## What's implemented

- **Main Menu → İlaç Yönetimi → Add/Edit medication** (`app/medication.tsx`
  handles both create and update via `?id=` param, mirroring the Kivy
  `editing_id` pattern)
- **Kayıtlı İlaçları Düzenle** — medication list with edit links (`app/med-list.tsx`)
- **Veri Girişi** — BP entry and medication-taken logging
- **Kayıtlar** — BP and medication logs, each with Year/Month/Day range
  filters (defaulting to today) and a table view with truncation, matching
  the grid-based log screens in the current `main.py`

## Data layer (`src/db/`)

- `database.ts` — schema + init. Every table carries `updated_at`, `deleted`,
  `synced` columns per the migration plan, even though nothing consumes them
  yet — this avoids a schema migration when Phase 4 (sync) lands.
- IDs are UUIDs (`expo-crypto`'s `randomUUID()`), not autoincrement ints, so
  rows created on different devices never collide once sync is added.
- `medications.ts`, `bpLogs.ts`, `medLogs.ts`, `categories.ts` — one file per
  table, plain functions (no ORM) so the SQL stays easy to compare against
  the original `main.py` queries.

## Known simplifications to revisit

- `med-list.tsx` renders the edit action as a separate list below the table
  instead of an inline button-in-cell (the original Kivy grid had it inline).
  Fine for now — swap in a custom row renderer if you want it merged back
  into one grid.
- No delete UI yet for medications, even though `deleteMedication()` (soft
  delete) exists in the repo layer — add a button once you decide where it
  should live in the flow.

## Theme (light/dark)

`src/theme/` holds the real switchable theme: `colors.ts` defines the light
and dark palettes, `ThemeContext.tsx` provides `useTheme()` (returns
`{ mode, colors, toggleTheme }`) and persists the chosen mode in the
`settings` SQLite table so it survives app restarts. Toggle button lives on
the main menu.

This is intentionally **not** tied to the OS light/dark setting —
`app.json`'s `userInterfaceStyle: "light"` stays fixed, which keeps Android's
automatic "force dark" from ever touching native `TextInput`/`Picker`
rendering again (that's what caused the original contrast bug). Every screen
now pulls its colors from `useTheme()` instead of hardcoding them, so the
toggle actually repaints everything, but it's fully app-controlled rather
than reacting to the phone's system theme.

No new native dependency was needed for this — it's pure JS state plus
`expo-status-bar` (already a dependency) for flipping the status bar icons
light/dark. No rebuild required for theme changes alone.

## Backup / Restore (`src/db/backup.ts`)

`exportData()` dumps all four tables to a JSON file and opens the share
sheet (so you can save it to Drive, send it to yourself, etc.).
`importData()` picks a JSON file and **merges** it in via
`INSERT OR IGNORE` inside a transaction — existing rows are left alone,
so importing never wipes what's already on the device. Both are wired to
buttons on the Kayıtlar (log) menu. This is the recommended flow before
uninstalling/reinstalling the app during development: export first, import
right after reinstalling.

## Safe area / navigation bar handling

All screens now use `SafeAreaView` (from `react-native-safe-area-context`,
wrapped in a `SafeAreaProvider` at the root layout) instead of a plain `View`
for their outer container, with `edges={["bottom"]}`. This fixes bottom
buttons (e.g. "Geri Dön" on the log screens) getting hidden behind Android's
gesture navigation bar. Screens using `ScrollView` keep the `ScrollView`
nested inside the `SafeAreaView` rather than replacing it, so scrolling still
works normally.

## Next steps (per the plan)

- Phase 2: Android home-screen widget (`react-native-android-widget`, needs
  a dev build)
- Phase 3: Wear OS companion app (separate Kotlin/Compose project)
- Phase 4: PHP API + sync engine — the DB layer above is already shaped for it

## Testing

npx expo prebuild -p android --clean
npx expo run:android

## to first time setup Android Environment without Android Studio

1. Download & set up the SDK command-line tools (fetches whatever the current version is, so this doesn't go stale):

bash
mkdir -p ~/Android/Sdk/cmdline-tools
cd ~/Android/Sdk/cmdline-tools

TOOLS_URL=$(curl -s https://developer.android.com/studio | grep -o 'https://dl.google.com/android/repository/commandlinetools-linux-[0-9]*_latest.zip' | head -1)
wget "$TOOLS_URL" -O tools.zip
unzip tools.zip
mv cmdline-tools latest
rm tools.zip

2. Set environment variables (add to ~/.bashrc):

bash
cat >> ~/.bashrc << 'EOF'
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
EOF
source ~/.bashrc

3. Accept licenses and install the actual SDK pieces:

bash
yes | sdkmanager --licenses

sdkmanager "platform-tools" \
 "build-tools;36.0.0" \
 "platforms;android-36" \
 "platforms;android-35" \
 "platforms;android-34"

4. (Optional but useful) Wear OS emulator images, so you can iterate on the watch app without your physical watch plugged in every time:

bash
sdkmanager "system-images;android-34;android-wear;x86_64"
sdkmanager "emulator"
adb devices

### To build this app for Android

1. cd android
2. ./gradlew assembleRelease
3. The APK will be in `android/app/build/outputs/apk/release/app-release.apk`

## To buid with EAS (Expo Application Services)

1. Install EAS CLI if you haven't already:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account:

```bash
eas login
```

3. Configure your project for EAS:

```bash
eas build:configure
```

4. Build the app for Android:

```bash
eas build --platform android
```

5. Create preview profile to get apk file for testing on eas.json file:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

6. Run the build command for the preview profile:

```bash
eas build --platform android --profile preview
```

7. To generate Google Play Store release build, run the following command:

```bash
eas build --platform android --profile production
```

## Editing existing log entries

`app/bp-log-edit.tsx` and `app/med-log-edit.tsx` (styled like the medication
add/edit form) let you fix a mis-typed reading after the fact instead of
only being able to delete-and-redo. Reachable by tapping any row in the
Kayıtlar tables (`DataTable` now takes an `onRowPress` prop). Both support
delete too, with a confirmation prompt. `src/db/bpLogs.ts` /
`src/db/medLogs.ts` got `get`/`update`/`delete` functions to match.

## Filter panel (collapsible, date+time separate, range filters)

The date range in the log screens now lives inside
`src/components/CollapsibleSection.tsx` (closed by default) so it doesn't
dominate the screen. Inside it:

- Date and time are **separate** `DateTimePickerButton`s (`mode="date"` /
  `mode="time"`) rather than one combined picker, per request.
- Defaults to the **last 7 days** (`start = today - 7`, `end = today`,
  full day bounds) rather than "today only."
- BP screen adds min/max range filters for Sys, Dia, and Pulse.
- Med screen adds a medication-name filter (populated from
  `listDistinctMedLogNames()` — every name that's ever actually been
  logged, not just currently-active medications).
- The date/time filtering itself moved from date-only (`date(timestamp)`)
  to full timestamp comparison, so the time-of-day bounds actually matter
  now instead of being silently ignored.

Table rows now also show the year (`28.08.2026 14:05` instead of the old
`08-28 14:05`), and columns have both extra padding and a divider line
between them (`DataTable`'s `cellDivider` style) — the previous layout had
the date and Sys columns touching with no visual separation.

## Widget fix: transparent buttons

If your home-screen widget ever shows blank/transparent content where
tapping still opens the app (rather than showing your last reading or the
quick-add buttons) — that's the widget's JS render silently failing,
leaving Android's fallback layout visible with only its default click
intent still wired up. Two changes address this:

1. `app.json`'s widget `minHeight` was bumped to `180dp` to fit the
   two-row layout (readout + the "+ Tansiyon"/"+ İlaç" quick-action row) —
   the old `120dp` was sized for the original single-row version.
2. `widget-task-handler.ts` now wraps the render in try/catch and always
   calls `renderWidget` with _something_ (a red error widget showing the
   exception message, as a last resort) instead of letting a thrown error
   leave you with nothing.

If it's still blank after `expo prebuild -p android --clean` +
`expo run:android` (needed since the size change is a native config, not
just JS), run `adb logcat | grep -i ReactNativeJS` right as you place the
widget — any exception will show up there and point at the real cause.

## Uygulama menüsü, bildirimler, hakkında

Header'da tema düğmesinin yanına bir ☰ menü düğmesi eklendi
(`app/_layout.tsx`) — `app/app-menu.tsx`'e gider, orada **Bildirimler**
(üstte) ve **Uygulama Hakkında** (altta) seçenekleri var.

- **`app/notifications.tsx`**: haftalık tekrarlayan tansiyon/ilaç
  hatırlatıcıları ekleyip silebileceğiniz ekran. Her hatırlatıcı tek bir
  gün + saat'e bağlı — aynı gün için birden fazla tansiyon hatırlatıcısı,
  ya da aynı ilaç için birden fazla hatırlatıcı eklemekte hiçbir kısıtlama
  yok (`src/db/reminders.ts`'de uniqueness constraint yok, her ekleme yeni
  bir satır). Native tarafı `expo-notifications` (`src/notifications/
scheduler.ts`) ile `SchedulableTriggerInputTypes.WEEKLY` trigger'ı
  kullanıyor — sadece Android için (weekday 1=Pazar...7=Cumartesi).
  Bildirim izni ilk hatırlatıcı eklenmeye çalışıldığında isteniyor
  (uygulama açılışında değil).
- **`app/about.tsx`**: uygulama adı, sürüm numarası (`expo-constants`
  üzerinden `app.json`'daki `version` alanından), paket adı.

### ⚠️ Gerekli manuel adım: `expo-notifications` kurulumu

Bu SDK 54 projesine `expo-notifications`'ı **elle eklemedim** —
`package.json`'a sabit bir versiyon yazmak yerine, doğru SDK-uyumlu
versiyonu `expo install`'un kendisinin çözmesini istiyoruz (bu projede
daha önce yanlış tahmin edilen versiyonlar birkaç kez soruna yol açtı):

```bash
npx expo install expo-notifications
npx expo prebuild -p android --clean
npx expo run:android
```

`app.json`'a zaten eklendi: `"expo-notifications"` plugin girişi ve
Android 12+ için `SCHEDULE_EXACT_ALARM` izni. `npm install` + yukarıdaki
üç komut yeterli.

## Dil desteği (Türkçe / İngilizce) ve Ayarlar sayfası

`src/i18n/translations.ts` her ekranda kullanılan her string için TR/EN
karşılığını içeren düz bir sözlük; `src/i18n/LanguageContext.tsx` da
`ThemeContext` ile aynı desende (`settings` tablosunda kalıcı, `useLanguage()`
hook'u ile `{ language, setLanguage, t }` döndürür). **Uygulamadaki her
ekran** artık `t("...")` kullanıyor — hardcoded Türkçe metin kalmadı.

Yeni **`app/settings.tsx`** ekranı (☰ menü → Ayarlar):

- **Dil** grubu: Türkçe/İngilizce arasında anlık geçiş (kaydet butonuna
  basmadan hemen uygulanır — tema geçişiyle aynı davranış).
- **Bulut Senkronizasyonu** grubu: web adresi + API token alanları,
  ileride Faz 4 (PHP API sync) için hazır bekliyor. Token bir kez
  kaydedildikten sonra `***` olarak gösteriliyor; değiştirmek için
  "Değiştir" butonuna basmak gerekiyor (`src/db/cloudSettings.ts`, yine
  `settings` tablosunu kullanıyor — yeni bir tabloya gerek yok).
- İki grup görsel olarak `src/components/GroupBox.tsx` ile ayrılmış
  (başlıklı, çerçeveli kutular — `CollapsibleSection`'ın aksine
  açılır/kapanır değil, her zaman görünür).
- Sayfa `ScrollView` içinde, küçük ekranlarda kayabiliyor.
- En altta **Kaydet** butonu bulut ayarlarını commit ediyor ve
  "Ayarlar kaydedildi." onayı gösteriyor.

Yeni bir ekran/metin eklerken: `translations.ts`'e hem `tr` hem `en`
anahtarını ekleyip ekranda `useLanguage().t("anahtar")` kullanmak yeterli.

## Wear OS companion app (`modules/wear-bridge`, sibling `wear-app/` project)

The actual watch app lives in a **separate project folder** (`wear-app/`,
delivered alongside this project, not inside it) — it's a standalone
Kotlin/Compose Wear OS app since Expo/React Native can't target Wear OS.
See its own README for build/install steps.

This project only contains the **receiving end**: `modules/wear-bridge` is
a local Expo native module that:

1. Registers a `WearableListenerService` (Android's system entry point for
   Data Layer messages) via its own `AndroidManifest.xml`, merged into the
   app's manifest automatically during `expo prebuild`.
2. Forwards received messages (`/bp-log`, `/med-log` paths, JSON payloads)
   to JS via `expo-modules-core` events.
3. `src/wear/useWearBridgeListener.tsx` (called once from `app/_layout.tsx`)
   subscribes to those events and calls the same `addBpLog`/`addMedLog`
   functions the phone's own screens use — so watch entries are
   indistinguishable from phone entries once saved, and the BP widget
   refreshes automatically too.

### Setup steps

```bash
npm install    # picks up the "wear-bridge": "file:./modules/wear-bridge" link
npx expo prebuild -p android --clean
npx expo run:android
```

No package name or signing certificate needs to match between this app and
the Wear OS app — that's only required for Play Store auto-install/
companion provisioning, not for a `WearableListenerService` registered for
`BIND_LISTENER` to receive a plain `MessageClient` message from any
connected node.

### Debugging tip

If watch messages never arrive: check `adb logcat | grep -i wearable` on
the **phone** while tapping KAYDET on the watch — Google Play Services logs
Data Layer connection/message events there, and it's usually obvious
whether the message left the watch vs. never made it to the listener
service.
