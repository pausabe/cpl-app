# Useful commands

    npx expo # Start the project, make sure to be using "Expo Go" (Press s to switch between modes)
    eas build --platform ios --profile simulator # Build the project for simulator
    eas channel:create # Create a new channel

# Deploy

#### Stores + OTA (big changes)

    eas build --platform ios --profile production
    eas build --platform android --profile production
    eas build --platform all --profile production

#### Only OTA (little changes)

    eas update --channel channel_name

#### Channel Names (X => build number)

    production_X
    test_X
    simulator

#### Instructions

- Database Updates
    1. Make sure that all code changes are pushed into master
    2. Download the latest database from the Deployment website
    3. Make the changes in the database
    4. Upload the database changes in the Deployment website and publish from there

- EAS Updates (NOT include Expo SDK changes)
    1. Make the code and/or database changes
    2. Make sure that we have the correct database under /cpl-app/src/Assets/db/ (it must be the one used to publish the
       current version)
    3. Change the version number X.X.(X+1) in app.json
    4. Add the changes in the changelog
    5. Push the code changes into master
    6. Press 'Update Production Repository' from deploy website Admin tab
    7. Publish using the EAS updates using the correct --channel (it must be the one used to publish the current
       version). You could also use Deployment website using the last database or the modified one

- Store Updates (include Expo SDK changes)
    1. Download the latest database from Deploy website (make sure _tables_log registers amount is equal to current
      published database version. Could not be when I rerun the Deploy website)
    2. Copy the database into src/Assets/db/
    3. Update the version name and build number from app.json (ending in 0, X.X.0)
    4. Change the channel name in eas.json with the build number
    5. Create the channel (eas channel:create)
    6. Build the project with EAS Build (eas build --platform all --profile production)
    7. Upload the Builds into the stores
    8. Add the changes in the changelog
    9. Push the code changes into master branch when releasing to production channels
    10. Press 'Update Production Repository' from deploy website Admin tab
    11. It may fail because the server need to upgrade some tools like npx expo (npm list expo), eas-cli (eas -v) or node (node -v). 
         Create a test channel and test every script inside the server host

# Clear Cache

    rm -rf node_modules
    npm cache clean --force
    npm install
