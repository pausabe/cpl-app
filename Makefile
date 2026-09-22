# Development entry points for cpl-app: tests, checks and local builds to try them on.
# The development app still opens with expo (npm run ios / npm run android).

export ANDROID_HOME ?= $(HOME)/Library/Android/sdk
ADB := $(ANDROID_HOME)/platform-tools/adb
MAESTRO ?= $(HOME)/.maestro/bin/maestro
APK := android/app/build/outputs/apk/release/app-release.apk
IOS_APP := ios/build/Build/Products/Release-iphonesimulator/CPL.app
IPHONE_APP := ios/build/Build/Products/Release-iphoneos/CPL.app

# The first Android emulator or phone connected, and the first iOS simulator open
ANDROID_DEVICE = $(shell $(ADB) devices 2>/dev/null | awk 'NR>1 && $$2=="device" {print $$1; exit}')
IOS_DEVICE = $(shell xcrun simctl list devices booted 2>/dev/null | grep -oE '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}' | head -1)
# The first iPhone connected (by cable, or over the network with Xcode open)
IPHONE = $(shell xcrun devicectl list devices 2>/dev/null | grep -E ' connected .*physical' | grep -oE '[0-9A-F]{8}-[0-9A-F]{16}' | head -1)

.PHONY: help start run-android run-ios run-web checks lint types format tests tests-fast golden android-app ios-app ios-device ui-tests ui-tests-android ui-tests-ios

help:
	@echo "make run-android       Open the development app on the Android emulator or phone"
	@echo "make run-ios           Open the development app on the iOS simulator"
	@echo "make run-web           Open the development app in the browser, with no emulator"
	@echo "make start             Only the development server (Metro), if the app is already installed"
	@echo ""
	@echo "make checks            Prettier, lint, types and every Jest test: what the hook runs before each push (~4 min)"
	@echo "make lint              ESLint (the Expo config): only errors stop a push, warnings do not"
	@echo "make types             TypeScript, without emitting anything (tsc --noEmit)"
	@echo "make format            Format the code (JS and TS) with Prettier: fixes what make checks reports"
	@echo ""
	@echo "make tests             Every Jest test: liturgy, app and services (~4 min)"
	@echo "make tests-fast        The same ones without the long sweeps (liturgy and screen text)"
	@echo "make golden            Rewrites the goldens (liturgy and screen text) from this build (only if you checked it)"
	@echo ""
	@echo "make android-app       Build the Android release and install it on the emulator or phone connected"
	@echo "make ios-app           Build the release for the iOS simulator and install it on the simulator open"
	@echo "make ios-device        Build the release for the iPhone connected and install it there as «CPL 9»"
	@echo "make ui-tests          Maestro flows on Android and on iOS"
	@echo "make ui-tests-android  Android only"
	@echo "make ui-tests-ios      iOS only"

# --- Development -----------------------------------------------------------------------------
# The first time these build and install the development app (expo-dev-client); after that, JS
# changes show up right away. For a release like the ones in the stores, make android-app /
# ios-app.

start:
	npx expo start

run-android:
	npx expo run:android

run-ios:
	npx expo run:ios

# In the browser the database opens in memory (DatabaseManagerService.web.tsx). There is no date
# picker in the calendar and no YouTube video in the Mass.
run-web:
	npx expo start --web

# --- Checks ----------------------------------------------------------------------------------
# make checks is what the .githooks/pre-push hook runs before each push. The tests run with --ci
# and without UPDATE_GOLDEN, so they compare against the goldens instead of rewriting them.

checks:
	npx prettier . --check
	npx eslint .
	npx tsc --noEmit
	env -u UPDATE_GOLDEN npx jest --ci

lint:
	npx eslint .

types:
	npx tsc --noEmit

# The texts, the Maestro flows and the data stay out of it (.prettierignore)
format:
	npx prettier . --write

# --- Jest ------------------------------------------------------------------------------------

tests:
	npx jest

tests-fast:
	npx jest --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/Liturgy/(LiturgyGolden|YearSweep)' '/Screens/PrayerTextGolden'

# A golden is what says «this is how it has to come out». It is rewritten only after checking by
# hand that the liturgy of this build is right: otherwise it stops catching anything. The screens
# one (prayer-screens.json) is the text the hours and the readings show: it was made before the
# redesign, and it has to stay the same.
golden:
	UPDATE_GOLDEN=1 npx jest __tests__/Liturgy __tests__/Screens/PrayerTextGolden

# --- Local builds for the Maestro tests -------------------------------------------------------
# /android and /ios are generated (and gitignored): they are rebuilt from scratch so that nothing
# is left from an earlier SDK.

android-app:
	@test -n "$(ANDROID_DEVICE)" || (echo "No Android emulator or phone connected (adb devices)" && exit 1)
	npx expo prebuild -p android --clean --no-install
	cd android && ./gradlew assembleRelease
	$(ADB) -s $(ANDROID_DEVICE) install -r $(APK)

ios-app:
	@test -n "$(IOS_DEVICE)" || (echo "No iOS simulator open (open -a Simulator)" && exit 1)
	npx expo prebuild -p ios --clean
	xcodebuild -workspace ios/CPL.xcworkspace -scheme CPL -configuration Release \
		-sdk iphonesimulator -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO -quiet
	xcrun simctl install $(IOS_DEVICE) $(IOS_APP)

# On the iPhone, next to the CPL from the store: that one belongs to team JB7WHGG69R, which we do
# not have on this Mac, and iOS does not allow replacing it. This one is cpl.cpl.dev («CPL 9»),
# signed with Joan's team (N65TK8GHAL). It needs Xcode 26.4 or later (Swift 6.3, for Expo 57).
ios-device:
	@test -n "$(IPHONE)" || (echo "No iPhone connected (xcrun devicectl list devices)" && exit 1)
	npx expo prebuild -p ios --clean
	sed -i '' 's/PRODUCT_BUNDLE_IDENTIFIER = cpl\.cpl;/PRODUCT_BUNDLE_IDENTIFIER = cpl.cpl.dev;/' ios/CPL.xcodeproj/project.pbxproj
	plutil -replace CFBundleDisplayName -string "CPL 9" ios/CPL/Info.plist
	xcodebuild -workspace ios/CPL.xcworkspace -scheme CPL -configuration Release \
		-destination id=$(IPHONE) -derivedDataPath ios/build \
		-allowProvisioningUpdates DEVELOPMENT_TEAM=N65TK8GHAL -quiet
	xcrun devicectl device install app --device $(IPHONE) $(IPHONE_APP)
	xcrun devicectl device process launch --device $(IPHONE) cpl.cpl.dev

# --- Maestro ---------------------------------------------------------------------------------
# They use the app already installed: after a change, run make android-app / ios-app first.

ui-tests: ui-tests-android ui-tests-ios

ui-tests-android:
	@test -n "$(ANDROID_DEVICE)" || (echo "No Android emulator or phone connected (adb devices)" && exit 1)
	$(MAESTRO) --device $(ANDROID_DEVICE) test .maestro/

ui-tests-ios:
	@test -n "$(IOS_DEVICE)" || (echo "No iOS simulator open (open -a Simulator)" && exit 1)
	$(MAESTRO) --device $(IOS_DEVICE) test .maestro/
