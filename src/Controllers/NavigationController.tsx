import * as React from 'react';
import {
    TouchableOpacity,
    View,
    Platform,
    Appearance
} from 'react-native';
import GLOBAL from "../Utils/GlobalKeys";
import HomeScreen from '../Controllers/HomeScreenController';
import SettingsScreen from '../Views/Settings/SettingsScreen';
import DonationScreen from '../Views/DonationScreen';
import CommentScreen from '../Views/CommentScreen';
import HoursLiturgyPrayerMainScreen from '../Views/HoursLiturgy/HoursLiturgyPrayerMainScreen';
import MassLiturgyMainScreen from '../Views/MassLiturgy/MassLiturgyMainScreen';
import Icon from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import {HoursPrayerController, MassPrayerController} from './PrayerController';
import AppThemeProvider from './AppThemeProvider';
import {navigationTheme, useTheme} from '../Theme';

const HomeStack = createStackNavigator();
const LHStack = createStackNavigator();
const LDStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// The theme follows the settings of the loaded day: the dark mode and the text size.
export default function NavigationController(props){
    return (
        <AppThemeProvider>
            <NavigationContainerView/>
        </AppThemeProvider>
    );
}

function getHeaderTitle(route) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home-Tab';
    switch (routeName) {
        case 'Home-Tab':
            return 'CPL';
        case 'LH-Tab':
            return 'Litúrgia de les Hores';
        case 'LD-Tab':
            return 'Missa';
    }
}

function getHeaderLeft(navigation, route){
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home-Tab';
    switch (routeName) {
        case 'Home-Tab':
            let params;
            if(typeof navigation.getState().routes[0].state == "object"){
                params = navigation.getState().routes[0].state.routes[0].state.routes[0].params;
            }
            return (
                <TouchableOpacity
                    style={{ height: '100%', justifyContent: 'center' }}
                    accessibilityRole="button"
                    accessibilityLabel="Calendari"
                    onPress={() => params?.calPres() }>
                    <View style={{ flex: 1, paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon
                            name="calendar-sharp"
                            size={30}
                            color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
            )
        case 'LH-Tab':
            return null;
        case 'LD-Tab':
            return null;
    }
}

function getHeaderRight(navigation, route){
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home-Tab';
    switch (routeName) {
        case 'Home-Tab':
            let params;
            if(typeof navigation.getState().routes[0].state == "object"){
                params = navigation.getState().routes[0].state.routes[0].state.routes[0].params;
            }
            return (
                <TouchableOpacity
                    style={{ height: '100%', justifyContent: 'center' }}
                    accessibilityRole="button"
                    accessibilityLabel="Configuració"
                    onPress={() => navigation.navigate('Settings', { Refresh_Date: params?.Refresh_Date })}>
                    <View style={{ flex: 1, paddingRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon
                            name="settings-outline"
                            size={30}
                            color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
            )
        case 'LH-Tab':
            return null;
        case 'LD-Tab':
            return null;
    }
}

/************ HOME ************/
function HomeStackScreen() {
    return (
        <HomeStack.Navigator screenOptions={{headerShown: false}}>
            <HomeStack.Screen
                name="HomeStack"
                component={HomeScreen}
            />
        </HomeStack.Navigator>
    );
}

/************ LH ************/
function LHStackScreen() {
    return (
        <LHStack.Navigator screenOptions={{headerShown: false}}>
            <LHStack.Screen
                name="LHStack"
                component={HoursLiturgyPrayerMainScreen}
            />
        </LHStack.Navigator>
    );
}

/************ LD ************/
function LDStackScreen() {
    return (
        <LDStack.Navigator screenOptions={{headerShown: false}}>
            <LDStack.Screen
                name="LDStack"
                component={MassLiturgyMainScreen}
            />
        </LDStack.Navigator>
    );
}

/************ TABS ************/
function Tabs() {
    return (
        <Tab.Navigator
            initialRouteName="Home-Tab"
            backBehavior="none"
            screenOptions={{
                tabBarStyle: { backgroundColor: GLOBAL.barColor },
                tabBarActiveBackgroundColor: GLOBAL.barColor,
                tabBarInactiveBackgroundColor: GLOBAL.barColor,
                tabBarShowLabel: false,
                lazy: true,
                headerShown: false,
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: '#D3D3D3',
            }}>
            <Tab.Screen
                name="Home-Tab"
                component={HomeStackScreen}
                options={{
                    tabBarAccessibilityLabel: "Inici",
                    lazy: true,
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            {focused ?
                                <MaterialCommunityIcons name="home" color={color} size={26} />
                                :
                                <MaterialCommunityIcons name="home-outline" color={color} size={26} />
                            }
                        </View>
                    )
                }}/>
            <Tab.Screen
                name="LH-Tab"
                component={LHStackScreen}
                options={{
                    tabBarAccessibilityLabel: "Litúrgia de les hores",
                    lazy: true,
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            {focused ?
                                <MaterialCommunityIcons name="bookmark" color={color} size={26} />
                                :
                                <MaterialCommunityIcons name="bookmark-outline" color={color} size={26} />
                            }
                        </View>
                    )
                }}/>
            <Tab.Screen
                name="LD-Tab"
                component={LDStackScreen}
                options={{
                    tabBarAccessibilityLabel: "Missa",
                    lazy: true,
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            {focused ?
                                <MaterialCommunityIcons name="book-open" color={color} size={26} />
                                :
                                <MaterialCommunityIcons name="book-open-outline" color={color} size={26} />
                            }
                        </View>
                    )
                }}/>
        </Tab.Navigator>
    );
}

function NavigationContainerView(){
    const theme = useTheme();
    return (
        <NavigationContainer theme={navigationTheme(theme)}>
            <View style={{flex: 1}}>
                <Stack.Navigator screenOptions={{ headerBackAccessibilityLabel: "Enrere" }}>
                    <Stack.Screen
                        name="Home"
                        component={Tabs}
                        options={({ navigation, route }) => ({
                            headerTitle: getHeaderTitle(route),
                            headerTitleAlign: 'center',
                            lazy: true,
                            headerStyle: { backgroundColor: GLOBAL.barColor },
                            headerTintColor: GLOBAL.itemsBarColor,
                            headerLeft: () => getHeaderLeft(navigation, route),
                            headerRight: () => getHeaderRight(navigation, route)
                        })}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={() => ({
                            title: "Configuració",
                            animation: Platform.OS === "ios" ? "default" : "none",
                            headerStyle: { backgroundColor: GLOBAL.barColor },
                            headerTintColor: GLOBAL.itemsBarColor,
                            headerBackTitleStyle: {color: GLOBAL.itemsBarColor},
                            headerBackButtonDisplayMode: "minimal",
                            headerBackImage: () => (<Icon name="chevron-back" size={30} color={GLOBAL.itemsBarColor} />)
                        })}
                    />
                    <Stack.Screen
                        name="Donation"
                        component={DonationScreen}
                        options={() => ({
                            title: "Donatiu lliure",
                            headerStyle: { backgroundColor: GLOBAL.barColor },
                            headerTintColor: GLOBAL.itemsBarColor,
                            animation: Platform.OS === "ios" ? "default" : "none",
                            headerBackTitleStyle: {color: GLOBAL.itemsBarColor},
                            headerBackButtonDisplayMode: "minimal",
                            headerBackImage: () => (<Icon name="chevron-back" size={30} color={GLOBAL.itemsBarColor} />)
                        })}
                    />
                    <Stack.Screen
                        name="Comment"
                        component={CommentScreen}
                        options={() => ({
                            title: "Missatge",
                            animation: Platform.OS === "ios" ? "default" : "none",
                            headerStyle: { backgroundColor: GLOBAL.barColor },
                            headerTintColor: GLOBAL.itemsBarColor,
                            headerBackTitleStyle: {color: GLOBAL.itemsBarColor},
                            headerBackButtonDisplayMode: "minimal",
                            headerBackImage: () => (<Icon name="chevron-back" size={30} color={GLOBAL.itemsBarColor} />)
                        })}
                    />
                    <Stack.Screen
                        name="LHDisplay"
                        component={HoursPrayerController}
                        options={({route }) => {
                            // The whole name of the hour: "Ofici de lectura", not "Ofici"
                            // @ts-ignore
                            const title = route.params?.title;
                            return ({
                                title: title,
                                animation: Platform.OS === "ios" ? "default" : "none",
                                headerStyle: {backgroundColor: GLOBAL.barColor},
                                headerTintColor: GLOBAL.itemsBarColor,
                                headerBackTitleStyle: {color: GLOBAL.itemsBarColor},
                                headerBackButtonDisplayMode: "minimal",
                                headerBackImage: () => (<Icon name="chevron-back" size={30} color={GLOBAL.itemsBarColor} />)
                            });
                        }}
                    />
                    <Stack.Screen
                        name="LDDisplay"
                        component={MassPrayerController}
                        options={() => ({
                            title: "Missa",
                            animation: Platform.OS === "ios" ? "default" : "none",
                            headerStyle: { backgroundColor: GLOBAL.barColor },
                            headerTintColor: GLOBAL.itemsBarColor,
                            headerBackTitleStyle: {color: GLOBAL.itemsBarColor},
                            headerBackButtonDisplayMode: "minimal",
                            headerBackImage: () => (<Icon name="chevron-back" size={30} color={GLOBAL.itemsBarColor} />)
                        })}
                    />
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    );
}

