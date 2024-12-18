import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  console.log(`Notification permission status: ${status}`);
  return status === 'granted';
}

// Storage key for tracking notifications
const NOTIFICATION_STORAGE_KEY = 'scheduledNotifications';

// Retrieve stored notification IDs
async function getStoredNotificationIds(): Promise<{ [key: string]: string }> {
  const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
  console.log('Retrieved stored notifications:', stored ? JSON.parse(stored) : {});
  return stored ? JSON.parse(stored) : {};
}

// Save notification IDs persistently
async function saveStoredNotificationIds(ids: { [key: string]: string }) {
  await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(ids));
  console.log('Saved notification IDs:', ids);
}


// Cancel specific notifications
async function cancelNotificationById(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    console.log(`Canceled notification with ID: ${id}`);
  } catch (error) {
    console.error(`Error canceling notification with ID: ${id}`, error);
  }
}

// Remove notifications for a specific habit
export async function removeNotificationsForHabit(habitName: string) {
  const storedNotifications = await getStoredNotificationIds();
  const updatedNotifications = { ...storedNotifications };

  Object.keys(storedNotifications).forEach((key) => {
    if (key.startsWith(`${habitName}-`)) {
      const notificationId = storedNotifications[key];
      cancelNotificationById(notificationId);
      delete updatedNotifications[key];
    }
  });

  await saveStoredNotificationIds(updatedNotifications);
  console.log(`Removed notifications for habit: "${habitName}"`);
}

// Function to check if a habit is already completed today
function isHabitCompletedToday(habit: any): boolean {
  const todayDate = new Date().toISOString().split("T")[0];
  const completedToday = habit.completionDates?.includes(todayDate);
  console.log(`Habit "${habit.name}" completed today: ${completedToday}`);
  return completedToday;
}

// Schedule a notification if the habit is incomplete
export async function scheduleNotification(habit: any, time: Date) {
  if (!habit || !habit.name) {
    console.error("Invalid habit passed to scheduleNotification:", habit);
    return;
  }

  const habitKey = `${habit.name}-${time.toISOString().split("T")[0]}`; // Unique key for today
  const storedNotifications = await getStoredNotificationIds();


  // Check if the habit is already completed today
  if (isHabitCompletedToday(habit)) {
    console.log(`Habit "${habit.name}" already completed today. Skipping notification.`);
    return;
  }

  // Check if a notification has already been scheduled for this habit
  if (storedNotifications[habitKey]) {
    console.log(
      `Notification for "${habit.name}" already scheduled with ID: ${storedNotifications[habitKey]}`
    );
    return;
  }

  // Schedule the notification
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: `Don't forget to complete your habit: ${habit.name}!`,
    },
    trigger: {
      hour: time.getHours(),
      minute: time.getMinutes(),
      repeats: false,
    },
  });

  // Store the notification ID
  storedNotifications[habitKey] = id;
  await saveStoredNotificationIds(storedNotifications);

  console.log(`Scheduled notification for "${habit.name}" with ID: ${id} at ${time}.`);
}
