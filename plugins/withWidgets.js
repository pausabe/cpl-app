// The widgets of the home screen. On Android they live in modules/cpl-widgets, which Expo links on
// its own. On iOS they are an app extension (targets/widgets) that @bacons/apple-targets adds to
// the Xcode project. The app and the extension share a group of apps, where the app leaves the
// words of the days to come for the widgets to read (controllers/widgetController).
//
// CPL_IOS_WIDGETS=0 leaves them out of iOS. The publishing workflow does it while the store's team
// has no identifier, group and profile for the extension: without them it could not be signed.
const withAppleTargets = require('@bacons/apple-targets/app.plugin');

module.exports = function withWidgets(config) {
  if (process.env.CPL_IOS_WIDGETS === '0') return config;
  config.ios = {
    ...config.ios,
    entitlements: {
      ...config.ios?.entitlements,
      'com.apple.security.application-groups': [`group.${config.ios.bundleIdentifier}`],
    },
  };
  return withAppleTargets(config);
};
