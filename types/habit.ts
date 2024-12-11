export type Habit = {
  name: string;
  startDate: string; // YYYY-MM-DD
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  customDays?: number[]; //(0 = Sunday, 1 = Monday, etc.)
  completionDates: string[];
  color?: string;
  currentStreak: number;
  bestStreak: number;
};
