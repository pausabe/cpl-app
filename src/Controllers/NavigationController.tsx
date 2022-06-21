import * as React from 'react';
import {TouchableOpacity, View, Platform, Alert} from 'react-native';
import GLOBAL from "../Globals/GlobalKeys";
import HomeScreen from '../Controllers/HomeScreenController';
import SettingsScreen from '../Views/SettingsScreen';
import DonationScreen from '../Views/DonationScreen';
import CommentScreen from '../Views/CommentScreen';
import LHScreen from '../Views/LHScreen/LHScreen';
import LHDisplayScreen from '../Views/LHScreen/LHDisplayScreen/LHDisplayScreen';
import LDScreen from '../Views/LDScreen/LDScreen';
import LDDisplayScreen from '../Views/LDScreen/LDDisplayScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'

const HomeStack = createStackNavigator();
const LHStack = createStackNavigator();
const LDStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function NavigationController(){
    return NavigationContainerView();
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
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
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
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
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
                component={LHScreen}
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
                component={LDScreen}
            />
        </LDStack.Navigator>
    );
}

/************ TABS ************/
function Tabs() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
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
    return (
        <NavigationContainer >
            <Stack.Navigator>
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
                        animationEnabled: Platform.OS === "ios",
                        headerStyle: { backgroundColor: GLOBAL.barColor },
                        headerTintColor: GLOBAL.itemsBarColor,
                        headerBackTitleVisible: false
                    })}
                />
                <Stack.Screen
                    name="Donation"
                    component={DonationScreen}
                    options={() => ({
                        title: "Donatiu lliure",
                        headerStyle: { backgroundColor: GLOBAL.barColor },
                        headerTintColor: GLOBAL.itemsBarColor,
                        animationEnabled: Platform.OS === "ios",
                        headerBackTitleVisible: false
                    })}
                />
                <Stack.Screen
                    name="Comment"
                    component={CommentScreen}
                    options={() => ({
                        title: "Missatge",
                        animationEnabled: Platform.OS === "ios",
                        headerStyle: { backgroundColor: GLOBAL.barColor },
                        headerTintColor: GLOBAL.itemsBarColor,
                        headerBackTitleVisible: false
                    })}
                />
                <Stack.Screen
                    name="LHDisplay"
                    component={LHDisplayScreen}
                    options={({route }) => {
                        // @ts-ignore
                        const title = route.params?.props.type;
                        return ({
                            title: title,
                            animationEnabled: Platform.OS === "ios",
                            headerStyle: {backgroundColor: GLOBAL.barColor},
                            headerTintColor: GLOBAL.itemsBarColor,
                            headerBackTitleVisible: false
                        });
                    }}
                />
                <Stack.Screen
                    name="LDDisplay"
                    component={LDDisplayScreen}
                    options={() => ({
                        title: "Missa",
                        animationEnabled: Platform.OS === "ios",
                        headerStyle: { backgroundColor: GLOBAL.barColor },
                        headerTintColor: GLOBAL.itemsBarColor,
                        headerBackTitleVisible: false
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}