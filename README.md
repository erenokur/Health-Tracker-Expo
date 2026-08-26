# Health Tracker — Expo App (Phase 1)

Phase 1 of the migration plan: Expo + expo-router + expo-sqlite, full local
feature parity with the original Kivy `main.py` — no network/sync yet
(that's Phase 4).

## Kurulum ve Çalıştırma (Install & Run)

Requires **Node.js 20+** (Node 22 or 24 recommended) and the **Expo Go** app
on your phone (SDK 54).

```bash
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
