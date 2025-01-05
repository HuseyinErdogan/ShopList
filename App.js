import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CreateListScreen from './src/screens/CreateListScreen';
import ListDetailsScreen from './src/screens/ListDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6B7280',
    secondary: '#9CA3AF',
    background: '#F5EEE6',
    surface: '#FFF8E3',
    accent: '#F3D7CA',
    text: '#374151',
    placeholder: '#9CA3AF',
    disabled: '#E5E7EB',
  },
};

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CreateList" component={CreateListScreen} />
      <Stack.Screen name="ListDetails" component={ListDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'cog' : 'cog-outline';
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.text,
            tabBarInactiveTintColor: theme.colors.secondary,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopWidth: 0,
              elevation: 4,
              shadowColor: theme.colors.text,
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              height: 60,
              paddingBottom: 8,
            },
            headerStyle: {
              backgroundColor: theme.colors.surface,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              color: theme.colors.text,
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeStack}
            options={{
              title: 'My Shopping List',
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
