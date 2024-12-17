import { getHabits } from "../../database/habits";
import { scheduleNotification } from "../utils/notificationManager";

export const isHabitDueToday = (habit: any) => {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const dayOfMonth = today.getDate();
  const todayDate = today.toISOString().split("T")[0]; // YYYY-MM-DD format

  const habitStartDate = new Date(habit.startDate);
  const habitDayOfWeek = habitStartDate.toLocaleDateString("en-US", { weekday: "long" });
  const habitDayOfMonth = habitStartDate.getDate();

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
      isDueToday = false;y
  }

  if (habitStartDate > today) {
    isDueToday = false;
  }

  const isCompleted = habit.completionDates?.includes(todayDate);

  return { isDueToday, isCompleted };
};

// Pre-schedule reminders for habits with reminders enabled
export const preScheduleReminders = async () => {
  const habits = await getHabits();
  const now = new Date();

  habits.forEach(async (habit) => {
    if (habit.reminderEnabled && isHabitDueToday(habit).isDueToday) {
      const reminderTime = new Date();
      reminderTime.setHours(10, 0); // Default notification time at 10:00 AM
      if (reminderTime > now) {
        await scheduleNotification(habit.name, reminderTime);
      }
    }
  });
};
