import { createNavigationContainerRef } from '@react-navigation/native';

// The navigation of the app, for whoever has to look at it or move it from outside a screen: the
// tests, and the tour of what is new (tourController)
export const navigationRef = createNavigationContainerRef<Record<string, object | undefined>>();
