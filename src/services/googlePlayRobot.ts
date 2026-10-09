import { requireOptionalNativeModule } from 'expo-modules-core';

// Google Play's robot. Every version uploaded to the store, even only to the internal track, is
// opened on a few phones of Google's test lab before anyone gets it (the pre-launch report): a robot
// touches everything to see that the app does not close, and writes anything in the boxes. It is no
// person, so it reports no use and its messages go nowhere: on 9 October 2026 one of its messages
// («hhkthk») reached the publishing website, and its phones were counted as new ones.
//
// Android says it with a setting of the system that Google puts only on those phones, which
// modules/cpl-test-lab reads. On iOS, on the web and in the tests there is no such module: never.

interface TestLabNativeModule {
  isTestLab(): boolean;
}

let answer: boolean | null = null;

export function isGooglePlayRobot(): boolean {
  if (answer === null) {
    try {
      answer = requireOptionalNativeModule<TestLabNativeModule>('CplTestLab')?.isTestLab() === true;
    } catch {
      answer = false;
    }
  }
  return answer;
}
