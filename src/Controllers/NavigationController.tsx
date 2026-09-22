import * as React from 'react';
import { Platform } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreenController from './HomeScreenController';
import { HoursPrayerController, MassPrayerController } from './PrayerController';
import SettingsController from './SettingsController';
import AppThemeProvider from './AppThemeProvider';
import { headerOptions, navigationTheme, useTheme } from '../Theme';

// One stack, no tabs: the home has everything of every day, and each hour, each reading and the
// settings open over it. Back always returns to the home. The message and the donation are
// sheets of the home (HomeScreenController).
//
// The stack is the native one (UINavigationController on iOS, fragments on Android): on iOS the
// transition and the swipe back are the system's own, at the refresh rate of the screen. The
// stack drawn by JavaScript did not look smooth going back on an iPhone of 120 Hz.
const Stack = createNativeStackNavigator();

// The navigator from outside the screens. The tests go back through it: the back arrow is the
// system's own now, and it is not drawn by JavaScript.
export const navigationRef = createNavigationContainerRef();

export default function NavigationController() {
  return (
    <AppThemeProvider>
      <Navigator />
    </AppThemeProvider>
  );
}

function Navigator() {
  const theme = useTheme();
  const header = headerOptions(theme);
  const inner = {
    ...header,
    // Sliding on iOS, as the system does; straight on Android, as before
    animation: Platform.OS === 'ios' ? ('default' as const) : ('none' as const),
    // The system's back arrow, alone. «Enrere» is what the screen reader hears on iOS.
    headerBackButtonDisplayMode: 'minimal' as const,
    headerBackTitle: 'Enrere',
  };
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme(theme)}>
      <Stack.Navigator id={undefined}>
        <Stack.Screen
          name="Home"
          component={HomeScreenController}
          options={{
            ...header,
            title: 'CPL',
            headerTitleAlign: 'center',
            headerTitleStyle: { ...header.headerTitleStyle, fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="LHDisplay"
          component={HoursPrayerController as any}
          options={({ route }: any) => ({ ...inner, title: route.params?.title })}
        />
        <Stack.Screen
          name="LDDisplay"
          component={MassPrayerController as any}
          options={({ route }: any) => ({ ...inner, title: route.params?.title ?? 'Missa' })}
        />
        <Stack.Screen name="Settings" component={SettingsController} options={{ ...inner, title: 'Configuració' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
