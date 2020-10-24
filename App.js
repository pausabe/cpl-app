import * as React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

const styles = StyleSheet.create({
  titleText: {
    textAlign: 'center',
    color: GLOBAL.itemsBarColor,
    fontSize: 20,
    fontWeight: '600',
  },
});

/************ HOME ************/
const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen}
        options={({ navigation, route }) => ({
          title: "CPL",
          headerStyle: { backgroundColor: GLOBAL.barColor },
          headerTintColor: GLOBAL.itemsBarColor,
          headerLeft: () => ( 
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
              onPress={() => route.params.calPres()}>
              <View style={{ flex: 1, paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  name="ios-calendar"
                  size={30}
                  color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
              onPress={() => navigation.navigate('Settings', { Refresh_Date: route.params.Refresh_Date })}>
              <View style={{ flex: 1, paddingRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  name="ios-settings"
                  size={30}
                  color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )
        })}
      />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="Donation" component={DonationScreen} />
      <HomeStack.Screen name="Comment" component={CommentScreen} />
    </HomeStack.Navigator>
  );
}

/************ LH ************/
const LHStack = createStackNavigator();
function LHStackScreen() {
  return (
    <LHStack.Navigator>
      <LHStack.Screen 
        name="LH" 
        component={LHScreen} 
        options={({ navigation, route }) => ({
          title: "Litúrgia de les Hores",
          headerStyle: { backgroundColor: GLOBAL.barColor },
          headerTintColor: GLOBAL.itemsBarColor,
        })}
      />
      <LHStack.Screen name="LHDisplay" component={LHDisplayScreen} />
    </LHStack.Navigator>
  );
}

/************ LD ************/
const LDStack = createStackNavigator();
function LDStackScreen() {
  return (
    <LDStack.Navigator>
      <LDStack.Screen 
        name="LD" 
        component={LDScreen} 
        options={({ navigation, route }) => ({
          title: "Missa",
          headerStyle: { backgroundColor: GLOBAL.barColor },
          headerTintColor: GLOBAL.itemsBarColor,
        })}
      />
      <LDStack.Screen name="LDDisplay" component={LDDisplayScreen} />
    </LDStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarOptions={{
          showLabel: false,
          activeTintColor: "white",
          inactiveTintColor: "#8d8c8c",
          style: {
            backgroundColor: GLOBAL.barColor,
          }
        }}>
        <Tab.Screen 
          name="Home" 
          component={HomeStackScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon
                name="ios-home"
                size={size}
                color={color} />
            )
          }}/>
        <Tab.Screen 
          name="LH" 
          component={LHStackScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon
                name="ios-bookmark"
                size={size}
                color={color} />
            )
          }}/>
        <Tab.Screen 
          name="LD" 
          component={LDStackScreen}  
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon
                name="ios-book"
                size={size}
                color={color} />
            )
          }}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}