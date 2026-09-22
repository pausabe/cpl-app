import * as React from 'react';
import {Platform, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreenController from './HomeScreenController';
import {HoursPrayerController, MassPrayerController} from './PrayerController';
import SettingsController from './SettingsController';
import AppThemeProvider from './AppThemeProvider';
import Icon from '../Components/Icon';
import {headerOptions, navigationTheme, useTheme} from '../Theme';

// One stack, no tabs: the home has everything of every day, and each hour, each reading and the
// settings open over it. Back always returns to the home. The message and the donation are
// sheets of the home (HomeScreenController).
const Stack = createStackNavigator();

export default function NavigationController() {
    return (
        <AppThemeProvider>
            <Navigator/>
        </AppThemeProvider>
    );
}

function Navigator() {
    const theme = useTheme();
    const header = headerOptions(theme);
    const inner = {
        ...header,
        // As before: sliding on iOS, straight on Android
        animation: Platform.OS === 'ios' ? 'default' as const : 'none' as const,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerBackAccessibilityLabel: 'Enrere',
        headerBackImage: () => (
            <View style={{paddingHorizontal: Platform.OS === 'ios' ? 8 : 0}}>
                <Icon name="back" size={28} color={theme.colors.onHeader}/>
            </View>
        ),
    };
    return (
        <NavigationContainer theme={navigationTheme(theme)}>
            <Stack.Navigator screenOptions={{headerBackAccessibilityLabel: 'Enrere'}}>
                <Stack.Screen
                    name="Home"
                    component={HomeScreenController}
                    options={{
                        ...header,
                        title: 'CPL',
                        headerTitleAlign: 'center',
                        headerTitleStyle: {...header.headerTitleStyle, fontWeight: '700', letterSpacing: 0.4},
                    }}/>
                <Stack.Screen
                    name="LHDisplay"
                    component={HoursPrayerController as any}
                    options={({route}: any) => ({...inner, title: route.params?.title})}/>
                <Stack.Screen
                    name="LDDisplay"
                    component={MassPrayerController as any}
                    options={({route}: any) => ({...inner, title: route.params?.title ?? 'Missa'})}/>
                <Stack.Screen
                    name="Settings"
                    component={SettingsController}
                    options={{...inner, title: 'Configuració'}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
