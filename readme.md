# CPL

<p align="center">
  <img src="./demo.gif" alt="" width="200" />
</p>

The app thousands of people use to pray the Liturgy of the Hours every day, in Catalan.

- [Apple App Store](https://apps.apple.com/es/app/litcat-cpl/id1283136025?l=en)
- [Android Play Store](https://play.google.com/store/apps/details?id=cpl.cpl)

## Where the texts come from

The liturgy lives in a SQLite database, `src/assets/db/cpl-app.db`, which **is not in the
repository**: it is published from [cpl-cloud](https://github.com/pausabe/cpl-cloud), where the CPL
corrects the texts and publishes them. Next to it, `cpl-app.db.json` says which published version
the app carries.

While the app is used, it asks `cpl-api.canmartorell.dev` at most once every six hours whether there
is a newer database for the structure it knows, downloads it and uses it the next time it opens
([databaseUpdateService](src/services/databaseUpdateService.ts)). So a corrected text reaches the
phones without a new version in the stores.

The code, on the other hand, only travels through the stores: there are no over-the-air updates.

To work on the app you need those two files and a key:

1. From the publishing website, download a published database and its `.json`, and put both in
   `src/assets/db/`.
2. Create a `.env` file (it is ignored by git; this repository is public) with the key the app
   carries: `EXPO_PUBLIC_CPL_APP_KEY=…`. Without it the app works, but it never asks for a new
   database.

## Working on it

```sh
npm install
make help        # every entry point: run, checks, tests, builds, Maestro
make run-ios     # or make run-android
make checks      # prettier, lint, types and every test: what the hook runs before a push
```

The Jest tests run the real liturgy against the real database, and the golden files hold the
resolved texts of hand-picked days. They are tied to the database they were made from: when the
database changes, check the app by hand and run `make golden`.

## Releasing

Everything goes through the stores, so each release is a build:

1. Put the published database and its `.json` in `src/assets/db/` (the ones the release will carry).
2. Bump `version`, `ios.buildNumber` and `android.versionCode` in `app.json`.
3. Write what changed in `changelog.md`.
4. `make android-app` and `make ios-device`, and try it on a real phone; `make ui-tests` for the
   Maestro flows.
5. Build for the stores and upload it.

Version numbers are `major.minor.patch`: the first for a redesign or a change of how it works, the
second for new things, the third for fixes.
