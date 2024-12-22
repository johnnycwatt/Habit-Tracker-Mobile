import { getHabits, deleteHabit } from "../../database/habits";
import { scheduleNotification, removeNotificationsForHabit } from "../utils/notificationManager";

export const isHabitDueToday = (habit: any) => {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-CA", { weekday: "long" });
  const dayOfMonth = today.getDate();
  const todayDate = today.toLocaleDateString('en-CA');

  const habitStartDate = new Date(habit.startDate);
  const habitDayOfWeek = habitStartDate.toLocaleDateString("en-CA", { weekday: "long" });
  const habitDayOfMonth = habitStartDate.getDate();

  // If startDate is in the future, the habit is not due
  if (habitStartDate > today) {
    console.log(`Habit "${habit.name}" is not due yet. Start date is in the future: ${habit.startDate}`);
    return { isDueToday: false, isCompleted: false };
  }

  let isDueToday = false;

  switch (habit.frequency) {
    case "Daily":
      isDueToday = true;
      break;

    case "Weekly":
      isDueToday = habitDayOfWeek === dayOfWeek;
      break;

    case "Monthly":
      isDueToday = habitDayOfMonth === dayOfMonth;
      break;

    case "Custom":
      isDueToday = habit.customDays?.includes(dayOfWeek);
      break;

    default:
      isDueToday = false;
  }

  //console.log(`Habit "${habit.name}" due today: ${isDueToday}`);
  return { isDueToday, isCompleted: habit.completionDates?.includes(todayDate) };
};


// Pre-schedule reminders for habits
export const preScheduleReminders = async () => {
  const habits = await getHabits();
  const now = new Date();


  habits.forEach(async (habit) => {
    const { isDueToday, isCompleted } = isHabitDueToday(habit);

    if (habit.reminderEnabled && isDueToday && !isCompleted) {
      const reminderTime = new Date();
      reminderTime.setHours(10, 0, 0, 0); // Default notification time at 10:00 AM

      if (reminderTime > now) {
        console.log(`Scheduling reminder for habit "${habit.name}" at ${reminderTime}.`);
        await scheduleNotification(habit, reminderTime);
      } else {
        console.log(`Reminder time for habit "${habit.name}" has already passed.`);
      }
    }
  });

};

// Handle habit deletion
export const deleteHabitAndRemoveNotifications = async (habitName: string) => {
  await deleteHabit(habitName);
  await removeNotificationsForHabit(habitName);
};

