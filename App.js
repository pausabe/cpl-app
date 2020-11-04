import * as React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'
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
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeStack = createStackNavigator();
const LHStack = createStackNavigator();
const LDStack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

function getHeaderTitle(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  switch (routeName) {
    case 'Home':
      return 'CPL';
    case 'LH':
      return 'Litúrgia de les Hores';
    case 'LD':
      return 'Missa';
  }
}

function getHeaderLeft(route){
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  switch (routeName) {
    case 'Home':
      return (
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
          onPress={() => route.state.routes[0].state.routes[0].params.calPres() }>
          <View style={{ flex: 1, paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Icon
              name="ios-calendar"
              size={30}
              color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )
    case 'LH':
      return null;
    case 'LD':
      return null;
  }
}

function getHeaderRight(navigation, route){
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  switch (routeName) {
    case 'Home':
      return (
        <TouchableOpacity 
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
          onPress={() => navigation.navigate('Settings', { Refresh_Date: route.state.routes[0].state.routes[0].params.Refresh_Date })}>
          <View style={{ flex: 1, paddingRight: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Icon
              name="ios-settings"
              size={30}
              color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )
    case 'LH':
      return null;
    case 'LD':
      return null;
  }
}

/************ HOME ************/
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen}
      />
    </HomeStack.Navigator>
  );
}

/************ LH ************/
function LHStackScreen() {
  return (
    <LHStack.Navigator>
      <LHStack.Screen 
        name="LH" 
        component={LHScreen} 
      />
    </LHStack.Navigator>
  );
}

/************ LD ************/
function LDStackScreen() {
  return (
    <LDStack.Navigator>
      <LDStack.Screen 
        name="LD" 
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
        barStyle={{ backgroundColor: GLOBAL.barColor }}>
      <Tab.Screen 
        name="Home" 
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
        name="LH" 
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
        name="LD" 
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
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home"
          component={Tabs}
          options={({ navigation, route }) => ({
            headerTitle: getHeaderTitle(route),
            headerTitleStyle: { alignSelf: 'center' },
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
            headerLeft: () => getHeaderLeft(route),
            headerRight: () => getHeaderRight(navigation, route)
          })}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={({ navigation, route }) => ({
            title: "Configuració",
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
          })}
        />
        <Stack.Screen 
          name="Donation" 
          component={DonationScreen} 
          options={({ navigation, route }) => ({
            title: "Donatiu lliure",
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
          })}
        />
        <Stack.Screen 
          name="Comment" 
          component={CommentScreen} 
          options={({ navigation, route }) => ({
            title: "Missatge",
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
          })}
        />
        <Stack.Screen 
          name="LHDisplay" 
          component={LHDisplayScreen} 
          options={({ navigation, route }) => ({
            title: route.params.props.type,
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
          })}
        />
        <Stack.Screen 
          name="LDDisplay" 
          component={LDDisplayScreen} 
          options={({ navigation, route }) => ({
            title: "Missa",
            headerStyle: { backgroundColor: GLOBAL.barColor },
            headerTintColor: GLOBAL.itemsBarColor,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}