# Debug
- Enable debug in device (cmd + D > Debug Remote JS)
- Configure IDE debugger bundle to 127.0.0.1:19000
- Use Google Chrome to open the Developer Tools
- Instructions:
    1. expo start
    2. Press Debug button with the IDE debugger bundle config
    3. Run ios/android
    4. If not working the first time, refresh the app

# Deploy
#### Stores + OTA (big changes)
    expo build:ios --release-channel channel_name
    expo build:android --release-channel channel_name

#### Only OTA (little changes)
    expo publish --release-channel channel_name

#### Channel Names (X => build number)
    prod_channel_X
    test_channel_X

#### Instructions
Due some errors, the database cannot be updated using OTA updates.
Therefore, when we...
- Update only database changes -> Use the Deploy website
    1. Make sure that all the code changes are pushed into repo
    2. Download the latest database from the Deploy website
    3. Make the changes in the database
    4. Upload the database changes in the Deploy website

- Update only code changes -> Use Expo build and upload the build to the stores
    1. Make the code changes
    2. Make sure that we have the correct database under /cpl-app/src/Assets/db/ (it must be the one used to publish the current version)
    3. Change the version number X.X.(X+1)
    4. Publish using the OTA updates using the correct release-channel (it must be the one used to publish the current version)
    5. Push the code changes into the master branch

- Update code & database -> Use expo build with a new release-channel name (prod_channel_47)
    1. Download the latest database from Deploy website
    2. Copy the database into src/Assets/db/
    3. Update the version name and build number of the manifest (ending in 0, X.X.0)
    4. Build the project (ios -> ipa | android -> apk)
    5. Upload the Builds into the stores
    6. Push the code changes into master branch