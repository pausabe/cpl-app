// Another bundle identifier for a build that is not the store's: make ios-device installs the app
// as cpl.cpl.dev («CPL 9»), next to the CPL of the store, which iOS does not let it replace.
// Before the other plugins, so that everything that comes from the identifier follows it: the
// widgets' extension (cpl.cpl.dev.widgets) and the group of apps they share (group.cpl.cpl.dev),
// which in the team of these builds cannot be the store's.
module.exports = function withBundleIdentifier(config) {
  const identifier = process.env.CPL_IOS_BUNDLE_IDENTIFIER;
  if (identifier) config.ios = { ...config.ios, bundleIdentifier: identifier };
  return config;
};
