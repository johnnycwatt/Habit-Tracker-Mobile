import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import AddHabitScreen from './screens/AddHabitScreen';
import HabitListScreen from './screens/HabitListScreen';
import EditHabitScreen from './screens/EditHabitScreen';
import ProgressScreen from './screens/ProgressScreen';
import ReportScreen from "./screens/ReportScreen";
const Stack = createStackNavigator();

// Custom Light Theme for Navigation
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8f9fa', // Light gray background
    primary: '#0288d1',    // Accent color for navigation
  },
};

export default function App() {
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0288d1', // Header background color
          },
          headerTintColor: '#fff', // Header text color
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          cardStyle: { backgroundColor: '#f8f9fa' }, // Screen background
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Habit Tracker' }}
        />
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{ title: 'Add a Habit' }}
        />
        <Stack.Screen
          name="HabitList"
          component={HabitListScreen}
          options={{ title: 'My Habits' }}
        />
        <Stack.Screen
          name="EditHabit"
          component={EditHabitScreen}
          options={{ title: 'Edit Habit' }}
        />
        <Stack.Screen
          name="ProgressScreen"
          component={ProgressScreen}
          options={{ title: 'Habit Progress' }}
        />
        <Stack.Screen
          name="ReportScreen"
          component={ReportScreen}
          options={{ title: 'Monthly Report' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
