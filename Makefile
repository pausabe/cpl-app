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
# The first iPhone connected (by cable, or over the network with Xcode open). One on the cable
# whose link with the Mac has dropped (after days locked, or a new Xcode) is only "available
# (paired)": it counts too, after the connected ones, and ios-device brings the link back. Over
# the network only a connected one counts, since other paired iPhones may be on the same wifi.
IPHONE = $(shell xcrun devicectl list devices --quiet --json-output /dev/stdout 2>/dev/null | jq -r '\
	[.result.devices[]? | select(.hardwareProperties.deviceType == "iPhone" and .hardwareProperties.reality == "physical") \
	| select(.connectionProperties.tunnelState == "connected" or .connectionProperties.transportType == "wired")] \
	| sort_by(.connectionProperties.tunnelState != "connected") | .[0].hardwareProperties.udid // empty')

.PHONY: help start run-android run-ios run-web db db-ca db-es db-latest db-infinite proposal db-which db-is-catalan checks checks-ci lint types format tests tests-fast golden litcal-sweep android-app ios-app ios-device ui-tests ui-tests-android ui-tests-ios captures captures-ios captures-android run-panel stop-panel day-check month progress review review-html db-fixed

help:
	@echo "make run-android       Open the development app on the Android emulator or phone"
	@echo "make run-ios           Open the development app on the iOS simulator"
	@echo "make run-web           Open the development app in the browser, with no emulator"
	@echo "make start             Only the development server (Metro), if the app is already installed"
	@echo ""
	@echo "make db                Bring the published database the app carries: it is not in the repository (16 MB)"
	@echo "make db-es             Put the Spanish database in its place instead, to look the texts over"
	@echo "make db-ca             Bring the Catalan one back (the same as make db)"
	@echo "make db-latest         Ask the website for the newest publication, even if a Catalan one is put aside"
	@echo "make db-infinite       The same database with its calendar out of litcal up to 2100 (not published)"
	@echo "make proposal          Write cpl-cloud's calendar/out again (and the proposal for the website), app untouched"
	@echo "make db-which          Say which language is sitting in src/assets/db right now"
	@echo ""
	@echo "make checks            Prettier, lint, types and every Jest test: what the hook runs before each push (~4 min)"
	@echo "make checks-ci         What the publishing workflow runs: make checks without the sweeps against the goldens"
	@echo "make lint              ESLint (the Expo config): only errors stop a push, warnings do not"
	@echo "make types             TypeScript, without emitting anything (tsc --noEmit)"
	@echo "make format            Format the code (JS and TS) with Prettier: fixes what make checks reports"
	@echo ""
	@echo "make tests             Every Jest test: liturgy, app and services (~4 min)"
	@echo "make tests-fast        The same ones without the long sweeps (liturgy and screen text)"
	@echo "make golden            Rewrites the goldens (liturgy and screen text) from this build (only if you checked it)"
	@echo "make litcal-sweep DB=… EXPECTED=…  Every day and place of the calendar table cpl-cloud writes from litcal (~30 min)"
	@echo ""
	@echo "make android-app       Build the Android release and install it on the emulator or phone connected"
	@echo "make ios-app           Build the release for the iOS simulator and install it on the simulator open"
	@echo "make ios-device        Build the release for the iPhone connected and install it there as «CPL 9»"
	@echo "make ui-tests          Maestro flows on Android and on iOS"
	@echo "make ui-tests-android  Android only"
	@echo "make ui-tests-ios      iOS only"
	@echo ""
	@echo "make captures          The screenshots of the two stores, at the size each one asks for"
	@echo "make captures-ios      The iPhone of 6,7\" and the iPad of 13\" (App Store)"
	@echo "make captures-android  The 1080x1920 of Google Play"
	@echo ""
	@echo "make progress                             How the migration is doing, the whole window, and what holds most days back"
	@echo "make month [YM=2026-09]                   The same for one month, day by day, and why each day is not at 100%"
	@echo "make day-check [DATE=2026-08-12]          The same for one day, field by field (today, if no date is given)"
	@echo "make db-fixed [FROM=…]                    The database in place with the db-fixes on top, for the migration (CPL_DB=…)"
	@echo "make review DATES=2026-08-20,2026-08-21   Day by day review against saints-app"
	@echo "make run-panel [PORT=4848]                The migration panel (if the port is taken, it offers another)"
	@echo "make stop-panel [PORT=4848]               Stop the panel"

# --- Development -----------------------------------------------------------------------------
# The first time these build and install the development app (expo-dev-client); after that, JS
# changes show up right away. For a release like the ones in the stores, make android-app /
# ios-app.

# None of these report use: they carry EXPO_PUBLIC_CPL_TEST_BUILD, which Metro writes into the
# bundle it builds here. Otherwise every simulator, every emulator and every Maestro run would
# count as one more person in the CPL's numbers, and a fresh emulator as a new one every time.
start run-android run-ios run-web android-app ios-app: export EXPO_PUBLIC_CPL_TEST_BUILD = 1

start:
	npx expo start

run-android:
	npx expo run:android

run-ios:
	npx expo run:ios

# In the browser the database opens in memory (databaseManagerService.web.ts). There is no date
# picker in the calendar and no YouTube video in the Mass.
run-web:
	npx expo start --web

# --- The database -----------------------------------------------------------------------------
# The texts are not in the repository: they come from the publishing website (cpl-cloud), the same
# one the phones ask. Needed to run the tests and to build the app. The key is in .env.
#
# A build carries one language, the one whose database is sitting in src/assets/db when Metro runs.
# make db-es puts the Spanish one there to be looked over; make db-ca brings the Catalan one back.
# There is nothing to switch inside the app: what is in that folder is what it prays with.

DATABASE_DIR = src/assets/db
DATABASE_DESCRIPTOR = $(DATABASE_DIR)/cpl-app.db.json
# Where the Spanish database is generated. It is a project of its own, outside this repository.
SPANISH_GENERATOR ?= ../cpl-db-es

# Going to another language puts the Catalan one aside instead of throwing it away, so coming back
# needs neither the network nor the key: sixteen megabytes on the disk are cheaper than a download you
# cannot make on a train.
DATABASE_KEPT = $(DATABASE_DIR)/cpl-app.ca.db

db: db-ca

db-ca:
	@if [ -f $(DATABASE_KEPT) ]; then \
		mv $(DATABASE_KEPT) $(DATABASE_DIR)/cpl-app.db; \
		mv $(DATABASE_KEPT).json $(DATABASE_DESCRIPTOR); \
		echo "Catalan database put back from $(DATABASE_KEPT)"; \
	else \
		git checkout -- $(DATABASE_DESCRIPTOR) 2>/dev/null || true; \
		node scripts/fetchDatabase.mjs; \
	fi
	@$(MAKE) --no-print-directory db-which

# Rebuilds the Spanish database from saints-app and puts it where Metro will find it. Not for a build
# that goes to anybody: the interface stays Catalan, texts inside the code and all.
db-es:
	@test -d $(SPANISH_GENERATOR) || (echo "No generator at $(SPANISH_GENERATOR) (set SPANISH_GENERATOR=)" && exit 1)
	$(MAKE) -C $(SPANISH_GENERATOR) db
	@if [ -f $(DATABASE_DIR)/cpl-app.db ] && ! grep -q '"language"' $(DATABASE_DESCRIPTOR) 2>/dev/null; then \
		mv $(DATABASE_DIR)/cpl-app.db $(DATABASE_KEPT); \
		mv $(DATABASE_DESCRIPTOR) $(DATABASE_KEPT).json; \
		echo "Catalan database kept at $(DATABASE_KEPT)"; \
	fi
	@cp $(SPANISH_GENERATOR)/out/cpl-app-es.db $(DATABASE_DIR)/cpl-app.db
	@cp $(SPANISH_GENERATOR)/out/cpl-app-es.db.json $(DATABASE_DESCRIPTOR)
	@$(MAKE) --no-print-directory db-which

# The website publishes again whenever the CPL corrects a text, and coming back from Spanish is
# deliberately offline, so neither make db nor make db-ca notices a new publication while a Catalan
# database is put aside: that is how you end up building with a version from months ago. This one
# always asks. The database put aside goes, because it is the old one: keeping it would have the
# next make db-ca bring it back.
db-latest:
	@if [ -f $(DATABASE_KEPT) ]; then \
		rm -f $(DATABASE_KEPT) $(DATABASE_KEPT).json; \
		echo "The Catalan database put aside was the old one, and is gone"; \
	fi
	@git checkout -- $(DATABASE_DESCRIPTOR) 2>/dev/null || true
	@node scripts/fetchDatabase.mjs
	@$(MAKE) --no-print-directory db-which

# The calendar up to 2100 in the database in place: cpl-cloud's process X takes it, keeps its texts and
# writes the table anyliturgic out of litcal, from 2017 to 2100. Start from the newest publication
# (make db-latest), or the website will say so when it is published. Nothing reaches the phones until
# that file (../cpl-cloud/calendar/out/cpl-app.db) is published on the website. The goldens are made from
# the published database and fail with this one, on purpose: make db-latest brings the published one back.
PROCESS_X ?= ../cpl-cloud/calendar

db-infinite: proposal
	@node scripts/infiniteDatabase.mjs $(PROCESS_X)/out/cpl-app.db
	@$(MAKE) --no-print-directory db-which

# The same without touching the app: process X writes its out/ again from the database in place (the
# databases, the 2027 spreadsheet for the CPL, and out/proposal, the proposal the website shows). For
# when a rule of litcal changes: then out/proposal goes up in the Calendari tab of the website.
proposal:
	@test -d $(PROCESS_X) || (echo "No process X at $(PROCESS_X) (set PROCESS_X=)" && exit 1)
	npm --prefix $(PROCESS_X) run write -- --db $(abspath $(DATABASE_DIR)/cpl-app.db)
	@echo "To show it to the CPL: upload $(PROCESS_X)/out/proposal in the Calendari tab of the website"

# Which language is in place, and whether the file and its descriptor still agree
db-which:
	@node scripts/whichDatabase.mjs

# --- Checks ----------------------------------------------------------------------------------
# make checks is what the .githooks/pre-push hook runs before each push. The tests run with --ci
# and without UPDATE_GOLDEN, so they compare against the goldens instead of rewriting them.

# The goldens are Catalan, and so is the descriptor the repository carries: running the checks with
# another language in place would fail by the hundred and say nothing about the code.
db-is-catalan:
	@node scripts/whichDatabase.mjs --require-catalan

checks: db-is-catalan
	npx prettier . --check
	npx eslint .
	npx tsc --noEmit
	env -u UPDATE_GOLDEN OUT_DIR=$(JEST_OUT) npx jest --ci --testPathIgnorePatterns $(JEST_IGNORED) $(DATA_DETECTORS)
	@$(MAKE) --no-print-directory db-fixed

# Without the two sweeps against the goldens: the goldens are not in the repository, and when
# they are missing they write themselves from the build being checked and pass without comparing
# anything. Everything else is checked.
checks-ci:
	npx prettier . --check
	npx eslint .
	npx tsc --noEmit
	env -u UPDATE_GOLDEN $(MAKE) tests-fast

lint:
	npx eslint .

types:
	npx tsc --noEmit

# The texts, the Maestro flows and the data stay out of it (.prettierignore)
format:
	npx prettier . --write

# --- Jest ------------------------------------------------------------------------------------

# The two data detectors (CPL-LIT-002 and CPL-LIT-003) check the copy make db-fixed makes, not the
# database in place: since 29 September 2026 the fixes stay off that one until the end of the
# migration (Pau's call), and against it they could only fail. make db-fixed runs them on the copy.
JEST_IGNORED := '/node_modules/' '/__tests__/helpers/'
DATA_DETECTORS := '/(ImmaculateConceptionTransfer|Psalm66PointingMark)\.test\.js$$'

# The pipeline tests (the join, the celebration probe, the Lauds and Compline extracts) write the
# migration's output, which is in git and is built from the fixed copy. Run here on the database
# in place they wrote over it (MIGRA-024), so they write to a scratch directory instead.
JEST_OUT := $(patsubst %/,%,$(or $(TMPDIR),/tmp))/cpl-jest-out

tests:
	OUT_DIR=$(JEST_OUT) npx jest --testPathIgnorePatterns $(JEST_IGNORED) $(DATA_DETECTORS)
	@$(MAKE) --no-print-directory db-fixed

tests-fast:
	OUT_DIR=$(JEST_OUT) npx jest --testPathIgnorePatterns $(JEST_IGNORED) $(DATA_DETECTORS) '/liturgy/(liturgyGolden|yearSweep)' '/screens/prayerTextGolden'

# A golden is what says «this is how it has to come out». It is rewritten only after checking by
# hand that the liturgy of this build is right: otherwise it stops catching anything. The screens
# one (prayer-screens.json) is the text the hours and the readings show: it was made before the
# redesign, and it has to stay the same.
golden:
	UPDATE_GOLDEN=1 npx jest __tests__/liturgy __tests__/screens/prayerTextGolden

# The calendar table that cpl-cloud's process X writes from litcal (calendar/, npm run write): every
# day and every place loaded the way the app loads it, against the celebration litcal chose. DB and
# EXPECTED are the two files it writes (out/cpl-app.db and out/expected.json); FROM and TO, years.
litcal-sweep:
	@test -n "$(DB)" -a -n "$(EXPECTED)" || (echo "make litcal-sweep DB=<cpl-app.db> EXPECTED=<expected.json> [FROM=2027 TO=2027]" && exit 1)
	node scripts/litcalSweep.mjs "$(DB)" "$(EXPECTED)" $(FROM) $(TO)

# --- Local builds for the Maestro tests -------------------------------------------------------
# /android and /ios are generated (and gitignored): they are rebuilt from scratch so that nothing
# is left from an earlier SDK.

android-app:
	@test -n "$(ANDROID_DEVICE)" || (echo "No Android emulator or phone connected (adb devices)" && exit 1)
	npx expo prebuild -p android --clean --no-install
	cd android && ./gradlew assembleRelease
	$(ADB) -s $(ANDROID_DEVICE) install -r $(APK)

IOS_SIMULATOR_BUILD = xcodebuild -workspace ios/CPL.xcworkspace -scheme CPL -configuration Release \
		-sdk iphonesimulator -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO -quiet

ios-app:
	@test -n "$(IOS_DEVICE)" || (echo "No iOS simulator open (open -a Simulator)" && exit 1)
	npx expo prebuild -p ios --clean
	$(IOS_SIMULATOR_BUILD)
	xcrun simctl install $(IOS_DEVICE) $(IOS_APP)

# On the iPhone, next to the CPL from the store: that one belongs to team JB7WHGG69R, which we do
# not have on this Mac, and iOS does not allow replacing it. This one is cpl.cpl.dev («CPL 9»),
# signed with Joan's team (N65TK8GHAL). It needs Xcode 26.4 or later (Swift 6.3, for Expo 57).
ios-device:
	@test -n "$(IPHONE)" || (echo "No iPhone connected (xcrun devicectl list devices)" && exit 1)
	xcrun devicectl device info details --device $(IPHONE) > /dev/null
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

# --- The screenshots of the stores ------------------------------------------------------------
# scripts/captures.mjs boots the device of each size, installs what was built here, runs the
# Maestro flow of .maestro/captures and composes each shot onto the canvas the store asks for.
# They carry EXPO_PUBLIC_CPL_TEST_BUILD like the rest of the local builds, so that taking the
# screenshots does not count as one more person in the CPL's numbers.

captures: captures-ios captures-android

captures-ios: export EXPO_PUBLIC_CPL_TEST_BUILD = 1
captures-ios:
	npx expo prebuild -p ios --clean
	$(IOS_SIMULATOR_BUILD)
	node scripts/captures.mjs ios-phone ios-tablet

captures-android: export EXPO_PUBLIC_CPL_TEST_BUILD = 1
captures-android:
	@test -n "$(ANDROID_DEVICE)" || (echo "No Android emulator or phone connected (adb devices)" && exit 1)
	npx expo prebuild -p android --clean --no-install
	cd android && ./gradlew assembleRelease
	node scripts/captures.mjs android-phone

# --- The Catalan migration to saints-app -------------------------------------------------------
# Tooling of its own, under migration-to-saints/: plain Node, with no install step. It reads
# cpl-app.db and saints-app; it never writes to either.

PORT ?= 4848
PANEL := migration-to-saints/webui/server.js

# The database in place with the two db-fixes on top, for the migration's runs: CPL_DB=$(FIXED_DB)
# before make review, the join or the panel. The one in place stays as it was published, which is
# what the goldens are made from and what make proposal takes its texts from; Pau decided on
# 29 September 2026 to put the fixes on it for good only at the end. Run it again after make db or
# make db-latest. FROM takes another database instead, like the one process X writes with the
# calendar out of litcal: FROM=$(PROCESS_X)/out/cpl-app.db, the same calendar saints-app prays with.
FIXED_DB := migration-to-saints/output/cpl-app.fixed.db
FROM ?= $(DATABASE_DIR)/cpl-app.db

db-fixed:
	cp $(FROM) $(FIXED_DB)
	sqlite3 $(FIXED_DB) < db-fixes/CPL-LIT-002.sql > /dev/null
	sqlite3 $(FIXED_DB) < db-fixes/CPL-LIT-003.sql > /dev/null
	CPL_DB=$(FIXED_DB) npx jest __tests__/services/ImmaculateConceptionTransfer.test.js __tests__/services/Psalm66PointingMark.test.js --silent
	@echo "CPL_DB=$(FIXED_DB)"

REVIEW := migration-to-saints/review
REVIEW_RUN := $(REVIEW)/run

# The full review, end to end. Read-only: it never touches cpl-app.db and never commits —
# corrections come out as prompts to run elsewhere (see .claude/skills/revisio-dia).
#
# Note it uses review/resolve-cpl-days.test.js, NOT migration-to-saints/cpl-day.test.js:
# the latter's Vespers ferial control is the rendered Vespers object itself, which marks
# every field ferial and invents false divergences on memorials.
review:
	@test -n "$(DATES)" || (echo "A list of dates is needed: make review DATES=2026-08-20,2026-08-21" && exit 1)
	@mkdir -p $(REVIEW_RUN)
	DATES=$(DATES) DIOCESE=$(or $(DIOCESE),Barcelona) OUT=$(REVIEW_RUN)/cpl-days.json \
		npx jest $(REVIEW)/resolve-cpl-days.test.js --silent
	DATES=$(DATES) node $(REVIEW)/build-rows.js
	node $(REVIEW)/commons-proposal.js
	node $(REVIEW)/day-gap.js

# The same run as a page, for scanning many days at once. `make review` no longer builds it.
review-html:
	node $(REVIEW)/build-report.js

# If the port is taken, offer the next free one instead of deciding on your behalf: the
# squatter may be a panel you still want, or something else entirely. Saying no falls back
# to the old behaviour (free the port and restart there), so a plain reload is still two
# keystrokes. Without a terminal to ask (CI, pipes) it goes straight to that fallback.
run-panel:
	@port=$(PORT); \
	if lsof -ti tcp:$$port -sTCP:LISTEN >/dev/null 2>&1; then \
		free=; p=$$port; \
		for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do \
			p=$$((p + 1)); \
			lsof -ti tcp:$$p -sTCP:LISTEN >/dev/null 2>&1 || { free=$$p; break; }; \
		done; \
		if [ -z "$$free" ]; then \
			echo "Port $$port taken and no free port between $$((port + 1)) and $$((port + 20))."; \
			exit 1; \
		fi; \
		ans=n; \
		if [ -r /dev/tty ]; then \
			printf "Port %s ocupat. Engego el panell al %s? [S/n] " "$$port" "$$free"; \
			read ans < /dev/tty || ans=s; \
		fi; \
		case "$$ans" in \
			""|s|S|si|Si|SI|sí|Sí|y|Y|yes) port=$$free ;; \
			*) $(MAKE) --no-print-directory stop-panel PORT=$$port ;; \
		esac; \
	fi; \
	exec node $(PANEL) $$port

stop-panel:
	@pids=$$(lsof -ti tcp:$(PORT) -sTCP:LISTEN 2>/dev/null); \
	if [ -n "$$pids" ]; then \
		echo "Stopping the panel on port $(PORT) (pid $$pids)"; \
		kill $$pids 2>/dev/null || true; \
		for i in 1 2 3 4 5 6 7 8 9 10; do \
			lsof -ti tcp:$(PORT) -sTCP:LISTEN >/dev/null 2>&1 || break; \
			sleep 0.3; \
		done; \
	fi

day-check:
	node migration-to-saints/day-check.js $(or $(DATE),$(shell date +%F))

# The three read the same generated output and nothing else — no database, no join — so they cost
# seconds and can be run as often as they are useful. They only move when the pipeline runs again.
progress:
	node migration-to-saints/day-check.js --progress

# The month the panel's calendar shows, on the terminal. Reads the generated output only — no
# database, no join — so it costs under a second and can be run as often as it is useful.
# Without YM, the month we are in.
month:
	node migration-to-saints/day-check.js $(or $(YM),$(shell date +%Y-%m))
