// The widgets of the home screen and the lock screen: a WidgetKit extension that
// @bacons/apple-targets (plugins/withWidgets) adds to the Xcode project and embeds in the app.
// Everything in this folder is part of it: the Swift, Info.plist and the two Literata fonts,
// which are links to the app's own (src/assets/fonts) so that there is only one copy of them.
//
// The identifier and the group follow the app's: cpl.cpl.widgets and group.cpl.cpl in the store,
// cpl.cpl.dev.widgets and group.cpl.cpl.dev when plugins/withBundleIdentifier changes it. The
// widgets read the words of the days from that group, where the app leaves them.

/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  displayName: 'CPL',
  bundleIdentifier: '.widgets',
  // containerBackground, contentMarginsDisabled and the widget previews are iOS 17
  deploymentTarget: '17.0',
  frameworks: ['SwiftUI', 'WidgetKit'],
  entitlements: {
    'com.apple.security.application-groups': [`group.${config.ios.bundleIdentifier}`],
  },
});
