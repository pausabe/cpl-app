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

### Deploy
#### Stores

    expo build:ios --no-publish
    expo build:android --no-publish

#### OTA
Només per petits canvis

    expo publish --release-channel channel_name -> https://expo.io/@pau.sabe/CPLApp?release-channel=test_channel
    expo publish
    