// frontend/src/navigation/AppTabs.js
import React, { useContext, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import NotificationScreen from '../screens/NotificationScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AccountScreen from '../screens/AccountScreen';
import { NotificationContext } from '../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { unreadCount, fetchUnreadCount } = useContext(NotificationContext);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={HistoryScreen} />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarBadge:
            unreadCount > 0
              ? unreadCount > 9
                ? '9+'
                : unreadCount
              : undefined,
        }}
      />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
