import * as React from 'react';
import {
    TouchableOpacity,
    View,
    Platform,
    Modal,
    Text,
    Appearance,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import GLOBAL from "../Utils/GlobalKeys";
import HomeScreen from '../Controllers/HomeScreenController';
import SettingsScreen from '../Views/Settings/SettingsScreen';
import DonationScreen from '../Views/DonationScreen';
import CommentScreen from '../Views/CommentScreen';
import HoursLiturgyPrayerMainScreen from '../Views/HoursLiturgy/HoursLiturgyPrayerMainScreen';
import HoursLiturgyPrayerScreen from '../Views/HoursLiturgy/HoursLiturgyPrayerScreen';
import MassLiturgyMainScreen from '../Controllers/MassLiturgy/MassLiturgyMainViewController';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import MassLiturgyPrayerScreen from '../Views/MassLiturgy/MassLiturgyPrayerScreen';
import * as Logger from "../Utils/Logger";
import { AppView, ViewTitle } from '../Services/Navigation/NavigationViewsKeys';

const HomeStack = createStackNavigator();
const LHStack = createStackNavigator();
const LDStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function NavigationController(props){
    return NavigationContainerView(props.IsNecessaryToUpdate);
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

function UpdateModal(IsNecessaryToUpdate){
    Logger.Log(Logger.LogKeys.NavigationController, "UpdateModal", "IsNecessaryToUpdate?", IsNecessaryToUpdate);

    if(!IsNecessaryToUpdate){
        return null;
    }

    return (
        <Modal animationType={"fade"}
               transparent={true} >
            <View style={styles.UpdateModalContainer}>
                <View style={styles.UpdateModalVisiblePartContainer}>
                    <View style={styles.UpdateModalTitleContainer}>
                        <Text style={styles.UpdateModalTitle}>{"Nova actualització"}</Text>
                    </View>
                    <View style={styles.UpdateModalTextContainer}>
                        <Text style={styles.UpdateModalText}>{"S'està actualitzant l'aplicació.\nQuan finalitzi es reiniciarà automàticament"}</Text>
                    </View>
                    <ActivityIndicator size="small" color={GLOBAL.barColor}/>
                </View>
            </View>
        </Modal>
    );
}

function NavigationContainerView(IsNecessaryToUpdate){
    return (
        <NavigationContainer >
            <View style={{flex: 1}}>
                {UpdateModal(IsNecessaryToUpdate)}
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
                        component={HoursLiturgyPrayerScreen}
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
                        name={AppView.MassLiturgyMainView}
                        component={MassLiturgyPrayerScreen}
                        options={() => ({
                            title: ViewTitle.MassLiturgyMainView,
                            animationEnabled: Platform.OS === "ios",
                            headerStyle: { backgroundColor: GLOBAL.barColor },
                            headerTintColor: GLOBAL.itemsBarColor,
                            headerBackTitleVisible: false
                        })}
                    />
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    UpdateModalContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 10,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    UpdateModalVisiblePartContainer:{
        marginVertical: 10,
        marginHorizontal: 25,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0,height: 2,}
    },
    UpdateModalTitleContainer:{
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 15
    },
    UpdateModalTitle:{
        fontSize: 17,
        fontWeight: 'bold',
        color: 'black',
    },
    UpdateModalTextContainer:{
        marginHorizontal: 15,
        marginBottom: 15
    },
    UpdateModalText:{
        fontSize: 15,
        fontWeight: 'normal',
        color: 'black',
    }
});
