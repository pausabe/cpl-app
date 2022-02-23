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

#### Channel Names
    prod_channel
    test_channel

#### Instructions
// TODO: change these instruction
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
    3. Get the update scripts file and placed into /cpl-app/Assets/DatabaseUpdateScript/UpdateScript.json (otherwise we could overwrite database changes from the website)
    4. Publish using the OTA updates using the correct release-channel (it must be the one used to publish the current version)

- Update code & database -> Use expo build with a new release-channel name (prod_channel_4.1)
    1. Download the latest database from Deploy website
    2. Copy the database into src/Assets/db/
    3. Update the version name and build number of the manifest
    4. Build the project (ios -> ipa | android -> apk)
    5. On the Deploy website, press 'Update' button (it will copy the latest uploaded database into the cpl-app project. It's necessary because the project pull we make before every deploy doesn't pull the database and we must have the same as the one in the new Build)
    6. Upload the Builds into the stores