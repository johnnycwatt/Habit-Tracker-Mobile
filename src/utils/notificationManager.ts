import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to request permissions
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Schedule a reminder notification
export async function scheduleNotification(habitName: string, time: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: `Don't forget to complete your habit: ${habitName}!`,
    },
    trigger: {
      hour: time.getHours(),
      minute: time.getMinutes(),
      repeats: true,
    },
  });
}
