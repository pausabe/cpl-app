# Deploy project repository
https://github.com/pausabe/deploy-cpl

# Necessary Tools
### expo-cli v4.9.1

    npm install --quiet -g expo-cli@4.9.1

### Dependencies

    npm install

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

### Deploy
#### Stores + OTA (big changes)

    expo build:ios --release-channel channel_name
    expo build:android --release-channel channel_name

#### Only OTA (little changes)

    expo publish --release-channel channel_name

#### Channel Names

    prod_channel
    test_channel

#### Instructions

    Due some errors database cannot be updated using OTA updates.
    Therefore, 
    - Update only database changes: use Deploy website
    - Update only code changes: use expo build and upload the build to the stores
    - Update code & database: use expo build with a new release-channel name (prod_channel_4.1)