# Entrades de desenvolupament de cpl-app: tests i compilacions locals per provar-los.
# L'app en desenvolupament es continua obrint amb expo (npm run ios / npm run android).

export ANDROID_HOME ?= $(HOME)/Library/Android/sdk
ADB := $(ANDROID_HOME)/platform-tools/adb
MAESTRO ?= $(HOME)/.maestro/bin/maestro
APK := android/app/build/outputs/apk/release/app-release.apk
IOS_APP := ios/build/Build/Products/Release-iphonesimulator/CPL.app

# El primer emulador/mòbil Android connectat i el primer simulador d'iOS obert
ANDROID_DEVICE = $(shell $(ADB) devices 2>/dev/null | awk 'NR>1 && $$2=="device" {print $$1; exit}')
IOS_DEVICE = $(shell xcrun simctl list devices booted 2>/dev/null | grep -oE '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}' | head -1)

.PHONY: help start run-android run-ios run-web tests tests-fast golden android-app ios-app ui-tests ui-tests-android ui-tests-ios

help:
	@echo "make run-android       Obre l'app en mode desenvolupament a l'emulador o mòbil Android"
	@echo "make run-ios           Obre l'app en mode desenvolupament al simulador d'iOS"
	@echo "make run-web           Obre l'app en mode desenvolupament al navegador, sense emulador"
	@echo "make start             Només el servidor de desenvolupament (Metro), si l'app ja hi és instal·lada"
	@echo ""
	@echo "make tests             Tots els tests de Jest: litúrgia, app i serveis (~1,5 min)"
	@echo "make tests-fast        Els mateixos sense els recorreguts llargs (litúrgia i text de les pantalles)"
	@echo "make golden            Refà els goldens (litúrgia i text de les pantalles) amb aquesta versió (només si l'has revisat)"
	@echo ""
	@echo "make android-app       Compila la release d'Android i la instal·la a l'emulador o mòbil connectat"
	@echo "make ios-app           Compila la release per al simulador d'iOS i la instal·la al simulador obert"
	@echo "make ui-tests          Fluxos de Maestro a Android i a iOS"
	@echo "make ui-tests-android  Només Android"
	@echo "make ui-tests-ios      Només iOS"

# --- Desenvolupament -------------------------------------------------------------------------
# El primer cop compilen i instal·len l'app de desenvolupament (expo-dev-client); després, els
# canvis de JS es veuen a l'instant. Per a una release com la de les botigues, make android-app /
# ios-app.

start:
	npx expo start

run-android:
	npx expo run:android

run-ios:
	npx expo run:ios

# Al navegador la base de dades s'obre en memòria (DatabaseManagerService.web.tsx). No hi ha el
# selector de data del calendari ni el vídeo de YouTube de la Missa.
run-web:
	npx expo start --web

# --- Jest ------------------------------------------------------------------------------------

tests:
	npx jest

tests-fast:
	npx jest --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/Liturgy/(LiturgyGolden|YearSweep)' '/Screens/PrayerTextGolden'

# El golden és el que diu «així ha de sortir». Es refà només després d'haver comprovat a mà
# que la litúrgia d'aquesta versió és correcta: si no, deixa de detectar res. El de les pantalles
# (prayer-screens.json) és el text que mostren les hores i les lectures: es va fer abans del
# redisseny, i ha de continuar igual.
golden:
	UPDATE_GOLDEN=1 npx jest __tests__/Liturgy __tests__/Screens/PrayerTextGolden

# --- Compilacions locals per als tests de Maestro --------------------------------------------
# /android i /ios són generats (gitignorats): es refan de zero perquè no quedi res d'un SDK
# anterior.

android-app:
	@test -n "$(ANDROID_DEVICE)" || (echo "Cap emulador ni mòbil Android connectat (adb devices)" && exit 1)
	npx expo prebuild -p android --clean --no-install
	cd android && ./gradlew assembleRelease
	$(ADB) -s $(ANDROID_DEVICE) install -r $(APK)

ios-app:
	@test -n "$(IOS_DEVICE)" || (echo "Cap simulador d'iOS obert (open -a Simulator)" && exit 1)
	npx expo prebuild -p ios --clean
	xcodebuild -workspace ios/CPL.xcworkspace -scheme CPL -configuration Release \
		-sdk iphonesimulator -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO -quiet
	xcrun simctl install $(IOS_DEVICE) $(IOS_APP)

# --- Maestro ---------------------------------------------------------------------------------
# Fan servir l'app que hi ha instal·lada: després d'un canvi, primer make android-app / ios-app.

ui-tests: ui-tests-android ui-tests-ios

ui-tests-android:
	@test -n "$(ANDROID_DEVICE)" || (echo "Cap emulador ni mòbil Android connectat (adb devices)" && exit 1)
	$(MAESTRO) --device $(ANDROID_DEVICE) test .maestro/

ui-tests-ios:
	@test -n "$(IOS_DEVICE)" || (echo "Cap simulador d'iOS obert (open -a Simulator)" && exit 1)
	$(MAESTRO) --device $(IOS_DEVICE) test .maestro/
