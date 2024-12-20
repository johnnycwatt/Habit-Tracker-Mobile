import { Habit } from "../types/habit";
import { differenceInCalendarDays, differenceInWeeks, differenceInMonths } from "date-fns";

const MAX_CONSECUTIVE_INCOMPLETE = 2;

const dayNameToIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const normalizeCustomDays = (customDays: (string | number)[]): number[] =>
  customDays.map((day) => (typeof day === "string" ? dayNameToIndex[day] : day));

const getCompletedDates = (habit: Habit): Date[] =>
  habit.completionDates.map((date) => new Date(date));

const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1; //Start the week with Monday
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
};


const getStartOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const getAdjustedStartOfMonth = (habit: Habit, today: Date): Date => {
  const habitStartDate = new Date(habit.startDate);
  const startOfMonth = getStartOfMonth(today);

  // If the habit started this month, adjust the start to the habit's start date
  if (
    habitStartDate.getFullYear() === today.getFullYear() &&
    habitStartDate.getMonth() === today.getMonth()
  ) {
    return habitStartDate;
  }
  return startOfMonth;
};

export const calculateCurrentStreak = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit).sort((a, b) => b.getTime() - a.getTime());
  if (!completedDates.length) return 0;

  const today = new Date();
  let streak = 0;

  switch (habit.frequency) {
    case "Daily":
      for (let i = 0; i < completedDates.length; i++) {
        const daysDiff = differenceInCalendarDays(today, completedDates[i]);
        if (daysDiff === streak) streak++;
        else if (daysDiff > streak + 1) break;
      }
      break;

    case "Weekly":
      for (let i = 0; i < completedDates.length; i++) {
        const weeksDiff = differenceInWeeks(today, completedDates[i]);
        if (weeksDiff === streak) streak++;
        else if (weeksDiff > streak + 1) break;
      }
      break;

    case "Monthly":
      for (let i = 0; i < completedDates.length; i++) {
        const monthsDiff = differenceInMonths(today, completedDates[i]);
        if (monthsDiff === streak) streak++;
        else if (monthsDiff > streak + 1) break;
      }
      break;

    case "Custom":
      const customDays = normalizeCustomDays(habit.customDays || []);
      for (let i = 0; i < completedDates.length; i++) {
        if (customDays.includes(completedDates[i].getDay())) streak++;
        else break;
      }
      break;
  }

  return streak;
};

export const calculateBestStreak = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit).sort((a, b) => a.getTime() - b.getTime());
  if (!completedDates.length) return 0;

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const daysDiff = differenceInCalendarDays(completedDates[i], completedDates[i - 1]);

    switch (habit.frequency) {
      case "Daily":
        if (daysDiff === 1) currentStreak++;
        else currentStreak = 1;
        break;

      case "Weekly":
        if (differenceInWeeks(completedDates[i], completedDates[i - 1]) === 1) currentStreak++;
        else currentStreak = 1;
        break;

      case "Monthly":
        if (differenceInMonths(completedDates[i], completedDates[i - 1]) === 1) currentStreak++;
        else currentStreak = 1;
        break;

      case "Custom":
        const customDays = normalizeCustomDays(habit.customDays || []);
        const prevDay = completedDates[i - 1].getDay();
        const currDay = completedDates[i].getDay();

        if (customDays.includes(prevDay) && customDays.includes(currDay) && daysDiff <= 2) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        break;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
  }

  return bestStreak;
};


export const calculateWeeklyCompletionRate = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit);
  const today = new Date();
  const habitStartDate = new Date(habit.startDate);

  // Determine if this is the first week, if so totalExpected is from Start Date not Monday
  const isFirstWeek = differenceInWeeks(today, habitStartDate) === 0;

  const startOfWeek = isFirstWeek ? habitStartDate : getStartOfWeek(today);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + (7 - startOfWeek.getDay()) % 7);

  let totalExpected = 0;
  let completed = 0;

  switch (habit.frequency) {
    case "Daily":
      totalExpected = differenceInCalendarDays(endOfWeek, startOfWeek) + 1;
      completed = completedDates.filter(
        (date) => date >= startOfWeek && date <= endOfWeek
      ).length;
      break;

    case "Weekly":
      totalExpected = 1;
      completed = completedDates.some(
        (date) => date >= startOfWeek && date <= endOfWeek
      )
        ? 1
        : 0;
      break;

    case "Custom":
      const customDays = normalizeCustomDays(habit.customDays || []);

      totalExpected = customDays.filter((day) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + (day - startOfWeek.getDay() + 7) % 7);
        return dayDate <= endOfWeek;
      }).length;

      completed = completedDates.filter((date) => {
        const dayOfWeek = date.getDay();
        return date >= startOfWeek && date <= endOfWeek && customDays.includes(dayOfWeek);
      }).length;
      break;

    default:
      totalExpected = 0;
      completed = 0;
  }

  console.log({
    habitStartDate,
    today,
    startOfWeek,
    endOfWeek,
    totalExpected,
    completed,
  });

  return totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0;
};




export const calculateMonthlyCompletionRate = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit);
  const today = new Date();
  const habitStartDate = new Date(habit.startDate);

  // Use the habit's start date if it's the first month, otherwise start from the 1st of the month
  const isFirstMonth =
    habitStartDate.getFullYear() === today.getFullYear() &&
    habitStartDate.getMonth() === today.getMonth();
  const startOfMonth = isFirstMonth ? habitStartDate : getStartOfMonth(today);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const adjustedEndOfMonth = new Date(endOfMonth);
  adjustedEndOfMonth.setDate(adjustedEndOfMonth.getDate() + (6 - endOfMonth.getDay()));

  let totalExpected = 0;
  let completed = 0;

  console.log("Starting Monthly Completion Calculation", {
    habitStartDate,
    startOfMonth,
    endOfMonth,
    today,
    frequency: habit.frequency,
    completedDates,
  });

  switch (habit.frequency) {
    case "Daily":
      // Ensure endOfMonth is correctly initialized
      const dailyEndOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dailyEndOfMonth.setHours(23, 59, 59, 999); // Ensure full inclusion of the month-end

      totalExpected = 0;
      for (
        let date = new Date(startOfMonth);
        date <= dailyEndOfMonth;
        date.setDate(date.getDate() + 1)
      ) {
        totalExpected++;
      }

      completed = completedDates.filter(
        (date) => date >= startOfMonth && date <= today
      ).length;

      console.log("Daily Frequency Debug:", {
        totalExpected,
        completed,
      });
      break;



    case "Weekly":
      const startDayOfWeek = habitStartDate.getDay();
      console.log("Start Day of Week:", startDayOfWeek);

      for (
        let date = new Date(startOfMonth);
        date <= adjustedEndOfMonth;
        date.setDate(date.getDate() + 1)
      ) {
        if (date.getDay() === startDayOfWeek && date >= habitStartDate) {
          totalExpected++;
          console.log("Expected Completion Day:", date.toLocaleDateString('en-CA'));
        }
      }

      completed = completedDates.filter((dateString) => {
        const date = new Date(dateString);
        return (
          date >= startOfMonth &&
          date <= today &&
          date.getDay() === startDayOfWeek
        );
      }).length;

      console.log("Weekly Frequency Debug:", {
        totalExpected,
        completed,
      });
      break;


    case "Monthly":
      // Check if at least one completion exists this month
      completed = completedDates.some(
        (date) => date >= startOfMonth && date <= today
      )
        ? 1
        : 0;
      totalExpected = 1; // For monthly habits, only 1 completion is expected

      console.log("Monthly Frequency Debug:", {
        totalExpected,
        completed,
      });

      return completed > 0 ? 100 : 0;

    case "Custom":
      const customDays = normalizeCustomDays(habit.customDays || []);
      console.log("Custom Days:", customDays);

      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999); // Adjust end of month to include 31st fully

      for (
        let date = new Date(startOfMonth);
        date <= endOfMonth;
        date.setDate(date.getDate() + 1)
      ) {
        if (customDays.includes(date.getDay()) && date >= habitStartDate) {
          totalExpected++;
          console.log("Custom Expected Day:", date.toLocaleDateString('en-CA'));
        }
      }

      completed = completedDates.filter(
        (date) =>
          date >= startOfMonth &&
          date <= today &&
          customDays.includes(date.getDay())
      ).length;

      console.log("Custom Frequency Debug:", {
        totalExpected,
        completed,
      });
      break;


    default:
      totalExpected = 0;
      completed = 0;
  }

  console.log("Final Calculation:", {
    totalExpected,
    completed,
    completionRate: totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0,
  });

  return totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0;
};


export const calculateMonthlyCompletionRateDescending = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit);
  const today = new Date();
  const adjustedStartOfMonth = getAdjustedStartOfMonth(habit, today);

  let totalExpected = 0;
  let completed = 0;

  switch (habit.frequency) {
    case "Daily":
      totalExpected =
        differenceInCalendarDays(today, adjustedStartOfMonth) + 1; // Days from adjusted start to today
      completed = completedDates.filter(
        (date) => date >= adjustedStartOfMonth && date <= today
      ).length;
      break;

    case "Weekly":
      totalExpected =
        Math.ceil(
          differenceInCalendarDays(today, adjustedStartOfMonth) / 7
        ) || 1; // Approx weeks since adjusted start
      completed = completedDates.filter(
        (date) => date >= adjustedStartOfMonth
      ).length;
      break;

    case "Monthly":
      totalExpected = 1; // One completion expected in the month
      completed = completedDates.some(
        (date) =>
          date >= adjustedStartOfMonth &&
          date < new Date(today.getFullYear(), today.getMonth() + 1, 1)
      )
        ? 1
        : 0;
      break;

    case "Custom":
      const customDays = normalizeCustomDays(habit.customDays || []);
      const startOfMonth = getStartOfMonth(today);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Calculate totalExpected for custom days
      for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        if (customDays.includes(date.getDay())) {
          totalExpected++;
        }
      }

      // Count completed occurrences
      completed = completedDates.filter(
        (date) =>
          date >= startOfMonth &&
          date <= today &&
          customDays.includes(date.getDay())
      ).length;

      break;

    default:
      totalExpected = 0;
      completed = 0;
  }

  console.log("Debugging Custom Frequency:", {
    totalExpected,
    completed,
    completionRate: totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0,
  });

  return totalExpected > 0
    ? Math.round((completed / totalExpected) * 100)
    : 0;
};








export const calculateWeeklyConsistency = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit);
  let consistentWeeks = 0;
  let consecutiveIncompleteWeeks = 0;

  const today = new Date();
  let currentWeek = getStartOfWeek(today);

  while (consecutiveIncompleteWeeks < MAX_CONSECUTIVE_INCOMPLETE) {
    const weekCompletions = completedDates.filter(
      (date) => date >= currentWeek && date < new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (weekCompletions > 0) {
      consistentWeeks++;
      consecutiveIncompleteWeeks = 0;
    } else {
      consecutiveIncompleteWeeks++;
    }

    currentWeek.setDate(currentWeek.getDate() - 7); // Move to the previous week
  }

  return consistentWeeks;
};


export const calculateMonthlyConsistency = (habit: Habit): number => {
  const completedDates = getCompletedDates(habit);
  let consistentMonths = 0;
  let consecutiveIncompleteMonths = 0;

  const today = new Date();
  const habitStartDate = new Date(habit.startDate);
  let currentMonth = getAdjustedStartOfMonth(habit, today);

  while (consecutiveIncompleteMonths < MAX_CONSECUTIVE_INCOMPLETE) {
    const monthCompletions = completedDates.filter(
      (date) =>
        date >= currentMonth &&
        date < new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    ).length;

    if (monthCompletions > 0) {
      consistentMonths++;
      consecutiveIncompleteMonths = 0;
    } else {
      consecutiveIncompleteMonths++;
    }

    // Move to the previous month only if it's after the habit's start date
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    if (currentMonth < habitStartDate) break;
  }

  return consistentMonths;
};
