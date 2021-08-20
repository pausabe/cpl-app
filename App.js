import * as React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform, SafeAreaView } from 'react-native';
import GLOBAL from "./src/Globals/Globals";
import HomeScreen from './src/Controllers/HomeScreenController';
import SettingsScreen from './src/Views/SettingsScreen';
import DonationScreen from './src/Views/DonationScreen';
import CommentScreen from './src/Views/CommentScreen';
import LHScreen from './src/Views/LHScreen/LHScreen';
import LHDisplayScreen from './src/Views/LHScreen/LHDisplayScreen/LHDisplayScreen';
import LDScreen from './src/Views/LDScreen/LDScreen';
import LDDisplayScreen from './src/Views/LDScreen/LDDisplayScreen';
import Icon from 'react-native-vector-icons/Ionicons';
Icon.loadFont();
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'

const HomeStack = createStackNavigator();
const LHStack = createStackNavigator();
const LDStack = createStackNavigator();
//const Tab = createMaterialBottomTabNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function getHeaderTitle(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home-Tab';
  console.log("routeName: " + routeName);
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
  console.log("routeName: " + routeName);
  switch (routeName) {
    case 'Home-Tab':
      var params;
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
  console.log("routeName: " + routeName);
  switch (routeName) {
    case 'Home-Tab':
      var params;
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
    <HomeStack.Navigator screenOptions={{lazy: false, headerShown: false}}>
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
    <LHStack.Navigator screenOptions={{lazy: false, headerShown: false}}>
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
    <LDStack.Navigator screenOptions={{lazy: false, headerShown: false}}>
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
        activeColor="white"
        inactiveColor="#D3D3D3"
        labeled={false}
        backBehavior="none"
        screenOptions={{
          tabBarStyle: { backgroundColor: GLOBAL.barColor }, 
          tabBarActiveBackgroundColor: GLOBAL.barColor, 
          tabBarInactiveBackgroundColor: GLOBAL.barColor, 
          tabBarShowLabel: false,
          lazy: false,
          headerShown: false, 
          tabBarActiveTintColor: 'white', 
          tabBarInactiveTintColor: '#D3D3D3',
        }}
        barStyle={{ backgroundColor: GLOBAL.barColor }}>
      <Tab.Screen 
        name="Home-Tab" 
        component={HomeStackScreen}
        options={{
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

export default function App() {
  return (
    <NavigationContainer theme={{ colors: { background: 'red' }}}>
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
          options={({ navigation, route }) => ({
            title: "Configuració",
            animationEnabled: Platform.OS === "ios",
            presentation: Platform.OS === "ios"? 'Modal' : 'transparentModal',
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
            headerBackTitleVisible: false
          })}
        />
        <Stack.Screen 
          name="Donation" 
          component={DonationScreen} 
          options={({ navigation, route }) => ({
            title: "Donatiu lliure",
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
            animationEnabled: Platform.OS === "ios",
            presentation: Platform.OS === "ios"? 'Modal' : 'transparentModal',
            headerBackTitleVisible: false
          })}
        />
        <Stack.Screen 
          name="Comment" 
          component={CommentScreen} 
          options={({ navigation, route }) => ({
            title: "Missatge",
            animationEnabled: Platform.OS === "ios",
            presentation: Platform.OS === "ios"? 'Modal' : 'transparentModal',
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
            headerBackTitleVisible: false
          })}
        />
        <Stack.Screen 
          name="LHDisplay" 
          component={LHDisplayScreen} 
          options={({ navigation, route }) => ({
            title: route.params?.props.type,
            animationEnabled: Platform.OS === "ios",
            presentation: Platform.OS === "ios"? 'Modal' : 'transparentModal',
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
            headerBackTitleVisible: false
          })}
        />
        <Stack.Screen 
          name="LDDisplay" 
          component={LDDisplayScreen} 
          options={({ navigation, route }) => ({
            title: "Missa",
            animationEnabled: Platform.OS === "ios",
            presentation: Platform.OS === "ios"? 'Modal' : 'transparentModal',
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
            headerBackTitleVisible: false
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}