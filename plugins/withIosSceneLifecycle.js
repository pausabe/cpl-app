// iOS 26 and later refuse to launch an app built with their SDK unless it adopts the scene-based
// life cycle: UIKit traps at startup with «UIScene life cycle is required for apps built with this
// SDK». Since Xcode 26 that is every build of this app, the ones the publishing workflow makes
// included, so without this the app installs and dies on opening.
//
// Expo 57 already ships what is needed, `ExpoAppSceneDelegate` (`@objc(EXExpoAppSceneDelegate)`),
// but nothing in the SDK wires it up yet: neither `expo prebuild` nor any of its plugins mention
// it, and neither does the bare template it copies from. This plugin does the wiring, which is two
// things:
//
//   1. Info.plist declares a scene whose delegate is that class, so UIKit instantiates it.
//   2. The app delegate stops creating the window and starting React Native, because the scene
//      does both now, and starts saying it is an `ExpoReactNativeFactoryProvider`, which is where
//      the scene reads the factory from. Without the conformance the scene calls `fatalError` on
//      purpose, with the same explanation.
//
// When a future Expo does this itself, the whole file goes away: the first sign will be the two
// checks below failing because the generated app delegate no longer looks like this.

const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE = 'EXExpoAppSceneDelegate';

// What the bare template writes today. If any of it stops matching, prebuild stops instead of
// quietly producing an app that traps on launch.
const CLASS_DECLARATION = 'class AppDelegate: ExpoAppDelegate {';
const STARTS_REACT_NATIVE = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

function patchAppDelegate(contents) {
  for (const expected of [CLASS_DECLARATION, STARTS_REACT_NATIVE]) {
    if (!contents.includes(expected)) {
      throw new Error(
        'withIosSceneLifecycle: the generated AppDelegate.swift no longer contains\n\n' +
          `${expected}\n\n` +
          'so it cannot be moved to the scene life cycle. Check whether this version of Expo ' +
          'already does it on its own, and if it does, remove this plugin.',
      );
    }
  }

  return contents
    .replace(CLASS_DECLARATION, 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {')
    .replace(
      STARTS_REACT_NATIVE,
      '    // The window and React Native are started by ExpoAppSceneDelegate, which iOS creates\n' +
        '    // from the scene declared in Info.plist',
    );
}

module.exports = function withIosSceneLifecycle(config) {
  config = withAppDelegate(config, (modConfig) => {
    if (modConfig.modResults.language !== 'swift') {
      throw new Error(`withIosSceneLifecycle: expected a Swift AppDelegate, found ${modConfig.modResults.language}.`);
    }
    modConfig.modResults.contents = patchAppDelegate(modConfig.modResults.contents);
    return modConfig;
  });

  return withInfoPlist(config, (modConfig) => {
    modConfig.modResults.UIApplicationSceneManifest = {
      // One window, which is what the app has always had
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE,
          },
        ],
      },
    };
    return modConfig;
  });
};
