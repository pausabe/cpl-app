// Google Play's robot: Android says it with a setting of the system that only the phones of Google's
// test lab have, which the module of the app (modules/cpl-test-lab) reads. Without that module (iOS,
// the web, an app built before it) it is never the robot.

function load(nativeModule) {
  let robot;
  jest.isolateModules(() => {
    jest.doMock('expo-modules-core', () => ({
      ...jest.requireActual('expo-modules-core'),
      requireOptionalNativeModule: (name) => (name === 'CplTestLab' ? nativeModule : null),
    }));
    robot = require('../../src/services/googlePlayRobot');
  });
  return robot;
}

test("a phone of Google's test lab is the robot", () => {
  expect(load({ isTestLab: () => true }).isGooglePlayRobot()).toBe(true);
});

test('any other phone is not, and neither is a phone without the module', () => {
  expect(load({ isTestLab: () => false }).isGooglePlayRobot()).toBe(false);
  expect(load(null).isGooglePlayRobot()).toBe(false);
});

test('if the module cannot say, it is a person: what a person writes must never be lost', () => {
  const failing = {
    isTestLab: () => {
      throw new Error('no React context');
    },
  };
  expect(load(failing).isGooglePlayRobot()).toBe(false);
});

test('it asks Android once: the phone does not change while the app is open', () => {
  const isTestLab = jest.fn(() => true);
  const robot = load({ isTestLab });

  robot.isGooglePlayRobot();
  robot.isGooglePlayRobot();

  expect(isTestLab).toHaveBeenCalledTimes(1);
});
