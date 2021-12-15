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
    Therefore, when we...
    - Update only database changes -> Use the Deploy website
      1. Download the latest database from the Deploy website
      2. Make the changes in the database
      3. Upload the changes database in the Deploy website

    - Update only code changes -> Use Expo build and upload the build to the stores
      1. Make the code changes
      2. Make sure that we have the correct database under /cpl-app/src/Assets/db/ (it must be the one used to publish the current version)
      3. Publish using the OTA updates using the correct release-channel (it must be the one used to publish the current version)

    - Update code & database -> Use expo build with a new release-channel name (prod_channel_4.1)
      1. Download the latest database from Deploy website
      2. Copy the database into src/Assets/db/
      3. Build the project (ios -> ipa | android -> apk)
      4. On the Deploy website, press 'Update Database' button (it will copy the latest uploaded database into the cpl-app project. It's necessary because the project pull we make before every deploy doesn't pull the database and we must have the same as the one in the new Build)
      5. Upload the Builds into the stores
