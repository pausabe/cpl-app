// The App Store lists the languages the iPhone app says it has, not the one it is written in. Expo
// leaves English as the language of the bundle, so up to 9.1.2 the listing said «English»; these
// two keys of the Info.plist are what make it say Catalan. The words iOS puts inside the app itself
// (the menu of a selected text) follow them too.
const app = require('../../app.json');

describe('the language of the iPhone app', () => {
  it('is Catalan, and only Catalan', () => {
    const { infoPlist } = app.expo.ios;

    expect(infoPlist.CFBundleDevelopmentRegion).toBe('ca');
    expect(infoPlist.CFBundleLocalizations).toEqual(['ca']);
  });
});
