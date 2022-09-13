# CPL

<p align="center">
  <img src="./demo.gif" alt="" width="200" />
</p>

This project is the app CPL that help thousands of users to pray the liturgy of the ours every day.
You will find it in the app markets:
- [Apple App Store](https://apps.apple.com/es/app/litcat-cpl/id1283136025?l=en)
- [Android Play Store](https://play.google.com/store/apps/details?id=cpl.cpl)

The app uses a deploy website for the updates. You will find the project here:
https://github.com/pausabe/deploy-cpl

# Necessary Tools
### Node.js
    < v17.0.0
### expo-cli v4.9.1
    npm install expo-cli@4.9.1
### Dependencies
    npm install
### Safe Area
(for some reason I don't know, we must install the following dependencies manually)

    expo install react-native-safe-area-context@3.2.0
    expo install react-native-webview@11.15.2

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

# Version Numbers
BreakingChanges.BuildNumber.OTARelease
