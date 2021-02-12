# Deploy project repository
https://github.com/pausabe/deploy-cpl

# Third-party Installs
### React Navigation

    npm install @babel/core --save
    npm install @react-navigation/stack
    npm install @react-navigation/bottom-tabs

    expo install react-native-gesture-handler
    expo install react-native-reanimated
    expo install react-native-screens
    expo install react-native-safe-area-context
    expo install @react-native-community/masked-view

### SQLite

    expo install expo-sqlite

### Metro config

    npm i metro-config --save-dev

### FileSystem

    expo install expo-file-system

### Assets

    expo install expo-asset

### Webview

    expo install react-native-webview

### AsyncStorage

    expo install @react-native-community/async-storage

### DateTimePicker

    expo install @react-native-community/datetimepicker

### Expo Device

    expo install expo-device

### Slider

    expo install @react-native-community/slider

### Splash Screen

    expo install expo-splash-screen

### Status Bar

    expo install expo-status-bar

### Bottom tab Icons

    npm install @react-navigation/material-bottom-tabs react-native-paper

### Constants

    expo install expo-constants

### Safe Area

    expo install react-native-safe-area-context


# Docs
### Expo Commands

    https://docs.expo.io/workflow/expo-cli/

### Run

    expo start

### Run in cache clean mode

    expo r -c

### app.json properties

    https://docs.expo.io/versions/latest/config/app/#properties

### Upgrade

    expo upgrade

### Deploy (TODO)
#### Stores
// El que comento a continuació no funciona com voldria... Sempre s'ha de passar per OTA
Si es fa servir el --no-publish, no puja la última versió del manifest (app.json).
En altres paraules, puja el build pero amb versió de manifest que hi havia en l'ultima publicació
Per publicar només standalone sense passar per OTA executar:
    1. expo build:ios --release-channel standalone_channel // expo build:android --release-channel standalone_channel
    2. Descarregar l'arxiu .ipa/.apk de expo.io
    3. Pujar-lo als stores (ios utilitzar l'app Transporter)

Per publicar standalone + OTA
    expo build:ios
    expo build:android

// No, el que estic fent ultimament és sempre publicar així:
    expo build:ios --release-channel prod_channel
    expo build:android --release-channel prod_channel

#### OTA
Només per petits canvis

    expo publish --release-channel test_channel -> https://expo.io/@pau.sabe/CPLApp?release-channel=test_channel
    expo publish
    

Channels -> prod_channel / test_channel
