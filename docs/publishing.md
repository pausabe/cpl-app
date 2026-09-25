# Publishing

The [Publish workflow](../.github/workflows/publish.yml) builds `master` and leaves it in the
internal track of Google Play and in TestFlight. Nobody downloads it from there by themselves: it
waits for whoever has to try it to be sent it.

It is started from the «Publica l'app» button of the publishing website (cpl-cloud), or by hand
from the Actions tab. There is no trigger on push: publishing is always a decision.

## What a run does

1. **Checks.** `make checks-ci`: Prettier, ESLint, TypeScript and the Jest tests. If anything is
   red, nothing is built.
2. **The database.** `scripts/fetchDatabase.mjs` brings down the newest publication for the
   structure this code reads, and writes `cpl-app.db` and its `.json`. So an app built today
   carries the texts published today. Android and iOS are built at the same time and each one
   brings it down on its own, so they are told which publication the checks settled on
   (`CPL_DATABASE_VERSION`): if the CPL publishes a correction while the app is being built, the
   run stops instead of leaving in the stores a database nobody was told about. Starting it again
   picks the new one up.
3. **The numbers.** `scripts/setBuildVersion.mjs` writes them into `app.json` before
   `expo prebuild`, which is what makes the native projects:
   - the version people read is the one in `app.json`, unless another one is typed in the form;
   - the build number, which is the only thing the stores ask never to go back, is 1000 plus the
     run number of the workflow.
4. **Android.** `expo prebuild`, the release key put into the generated `build.gradle`,
   `gradlew bundleRelease`, and the bundle to the internal track. Before uploading it checks that
   the bundle is not signed with the debug key, which is the one Expo leaves in.
5. **iOS.** `expo prebuild`, the certificate into a keychain made for that build, the project told
   exactly what to sign with, `xcodebuild archive`, and the file to App Store Connect. When Apple
   has processed it, a last job writes what has to be tried, in Catalan, in TestFlight.

6. **Telegram.** When everything is over, a message says how it went: which store took it, which
   database it carries and what has to be tried. It is sent whether it went well or badly, which
   is when it matters most. Without the bot set up, nothing is sent and the publication is not
   affected.

Both platforms take a while: Android around twenty minutes, iOS around forty. The repository is
public, so the minutes cost nothing. Nobody has to stay watching: the message says when it is
over.

## What has to be set up

All of this lives in GitHub secrets (Settings → Secrets and variables → Actions). A secret is
never given to a pull request from a fork, and only someone who can write to the repository can
start the workflow.

Each one can be written from the terminal, which saves copying long texts around:

```sh
gh secret set NAME --repo pausabe/cpl-app                 # asks for it
gh secret set NAME --repo pausabe/cpl-app < a-file        # from a file
```

### The key of the app

| Secret         | What it is                                                             |
| -------------- | ---------------------------------------------------------------------- |
| `CPL_APP_KEY`  | The same `EXPO_PUBLIC_CPL_APP_KEY` of `.env`: what the app shows cpl-api |

It has to be one of the keys `APP_KEYS` of the `cpl-api` Worker, or the app that comes out of the
build will never be given a new database.

### Android

| Secret                         | What it is                                       |
| ------------------------------ | ------------------------------------------------ |
| `ANDROID_KEYSTORE`             | The upload keystore, in base64                    |
| `ANDROID_KEYSTORE_PASSWORD`    | The password of the keystore                      |
| `ANDROID_KEY_ALIAS`            | The name of the key inside it                     |
| `ANDROID_KEY_PASSWORD`         | The password of the key                           |
| `GOOGLE_PLAY_SERVICE_ACCOUNT`  | The whole JSON of the service account that uploads |

The keystore is **the** thing that cannot be lost: Google Play only takes a bundle signed with the
key the app was published with. Keep it outside the repository, and a copy somewhere else.

```sh
base64 -i upload.jks | gh secret set ANDROID_KEYSTORE --repo pausabe/cpl-app
keytool -list -v -keystore upload.jks       # to see the alias, if it is not written down
```

The service account is made in Google Cloud (IAM → Service accounts → Keys → JSON) and then
invited in Play Console → Users and permissions, with, for `cpl.cpl`, the permission **Release to
testing tracks**. Without that one the upload works and the last step fails, saying only that the
caller does not have permission.

### Telegram

| Secret                | What it is                                        |
| --------------------- | ------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`  | The token of the bot, from @BotFather              |
| `TELEGRAM_CHAT_ID`    | Who it writes to: a person, a group or a channel   |

Optional: without them the publication works the same and says nothing. To find the chat, write
to the bot once and read it from the updates:

```sh
curl -s "https://api.telegram.org/bot<token>/getUpdates" | grep -o '"chat":{"id":[-0-9]*'
```

### iOS

| Secret                          | What it is                                                |
| ------------------------------- | --------------------------------------------------------- |
| `IOS_TEAM_ID`                   | The team the app belongs to (`JB7WHGG69R`)                 |
| `IOS_CERTIFICATE`               | The distribution certificate with its private key, in base64 |
| `IOS_CERTIFICATE_PASSWORD`      | The password given when exporting it                       |
| `IOS_PROVISIONING_PROFILE`      | The App Store profile of `cpl.cpl`, in base64               |
| `APP_STORE_CONNECT_KEY_ID`      | The identifier of the App Store Connect key                 |
| `APP_STORE_CONNECT_ISSUER_ID`   | The issuer identifier, the same for every key of the team    |
| `APP_STORE_CONNECT_KEY`         | The `.p8` of that key, in base64                            |

The certificate is made from this Mac, because what is exported has to carry the private key:

1. Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority,
   saved to disk.
2. developer.apple.com → Certificates → + → **Apple Distribution**, upload the request, download
   the `.cer` and open it.
3. In Keychain Access, the new certificate → Export → `.p12`, with a password.

The profile, on developer.apple.com → Profiles → + → **App Store Connect**, for the App ID
`cpl.cpl` and that certificate. The App Store Connect key, in App Store Connect → Users and Access
→ Integrations → App Store Connect API, with the **App Manager** role; the `.p8` can only be
downloaded once.

```sh
base64 -i certificate.p12 | gh secret set IOS_CERTIFICATE --repo pausabe/cpl-app
base64 -i profile.mobileprovision | gh secret set IOS_PROVISIONING_PROFILE --repo pausabe/cpl-app
base64 -i AuthKey_XXXXXXXX.p8 | gh secret set APP_STORE_CONNECT_KEY --repo pausabe/cpl-app
```

Certificates and profiles expire, the certificate after a year: when a run stops signing, that is
the first thing to look at.

## When something goes wrong

- **The bundle is signed with the debug key.** The Expo template changed and
  `scripts/patchAndroidSigning.mjs` no longer finds where to put the key. It stops the build
  before uploading anything.
- **The caller does not have permission,** at the end of the Android upload: the service account
  can upload but not publish. It is the checkbox of Play Console above.
- **No Xcode new enough.** Expo 57 carries Swift 6.3 code and wants Xcode 26.4 or later. The
  workflow looks for it among the ones on the machine and stops if there is none, instead of
  failing deep inside the build.
- **The build is still being processed** when the text of what to try is written: it is only a
  warning. The app is already in TestFlight; the text can be written there by hand.
