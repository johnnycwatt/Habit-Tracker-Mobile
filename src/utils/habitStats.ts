import { Habit } from "../types/habit";
import { differenceInCalendarDays, differenceInWeeks, differenceInMonths } from "date-fns";

const MAX_CONSECUTIVE_INCOMPLETE = 2;

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
      const customDays = habit.customDays || [];
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
  let bestStreak = 0;
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
        const customDays = habit.customDays || [];
        const prevDay = completedDates[i - 1].getDay();
        const currDay = completedDates[i].getDay();
        const dayDiff = differenceInCalendarDays(completedDates[i], completedDates[i - 1]);

        if (customDays.includes(currDay) && customDays.includes(prevDay) && dayDiff <= 2) {
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
  const startOfWeek = getStartOfWeek(today);

  let totalExpected = 0;
  let completed = 0;

  switch (habit.frequency) {
    case "Daily":
      totalExpected = 7;
      completed = completedDates.filter((date) => date >= startOfWeek).length;
      break;

    case "Weekly":
      totalExpected = 1;
      completed = completedDates.some((date) => date >= startOfWeek) ? 1 : 0;
      break;

    case "Custom":
      const customDays = habit.customDays || [];
      totalExpected = customDays.length;
      completed = completedDates.filter((date) => customDays.includes(date.getDay())).length;
      break;
  }

  return totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0;
};


export const calculateMonthlyCompletionRate = (habit: Habit): number => {
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
      const customDays = habit.customDays || [];
      totalExpected =
        customDays.reduce((count, day) => {
          for (
            let d = adjustedStartOfMonth.getDate();
            d <= today.getDate();
            d++
          ) {
            const date = new Date(
              today.getFullYear(),
              today.getMonth(),
              d
            );
            if (date.getDay() === day) count++;
          }
          return count;
        }, 0) || 0;

      completed = completedDates.filter((date) => {
        const dayOfWeek = date.getDay();
        return (
          date >= adjustedStartOfMonth && customDays.includes(dayOfWeek)
        );
      }).length;
      break;
  }

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
