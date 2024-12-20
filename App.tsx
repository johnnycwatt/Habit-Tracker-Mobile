import React, { useEffect } from 'react';
import { Image, StatusBar } from 'react-native'; // Import StatusBar
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from "./src/context/themeContext";
import { preScheduleReminders } from "./src/utils/habitScheduler";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import AddHabitScreen from './screens/AddHabitScreen';
import HabitListScreen from './screens/HabitListScreen';
import EditHabitScreen from './screens/EditHabitScreen';
import ProgressScreen from './screens/ProgressScreen';
import ReportScreen from "./screens/ReportScreen";
import SettingsScreen from "./screens/SettingsScreen";
import PrivacyPolicy from "./screens/PrivacyPolicyScreen";

const Stack = createStackNavigator();

function AppWithTheme() {
  const { theme } = useTheme();

  useEffect(() => {
    const initializeReminders = async () => {
      await preScheduleReminders();
    };
    initializeReminders();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <StatusBar
      barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
      backgroundColor={theme.colors.background}
    />


      <NavigationContainer theme={theme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.headerStyle },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
            cardStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("./assets/images/habitTrackerIconNoBackground.png")} // Path to your logo
                  style={{ width: 70, height: 70, resizeMode: "contain" }}
                />
              ),
              headerTitleAlign: "center", // Center-align the logo
            }}
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
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicy}
            options={{ title: 'Privacy Policy' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppWithTheme />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
