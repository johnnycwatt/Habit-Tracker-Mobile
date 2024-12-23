import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
  calculateWeeklyConsistency,
  calculateMonthlyConsistency,
} from "../../utils/habitStats";
import { Habit } from "../../types/habit";

describe("HabitStats Utility Functions", () => {
  const createHabit = (overrides: Partial<Habit> = {}): Habit => ({
    name: "Test Habit",
    startDate: "2024-01-01",
    frequency: "Daily",
    completionDates: [],
    currentStreak: 0,
    bestStreak: 0,
    ...overrides,
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2024-12-11T00:00:00Z").getTime());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Current Streak Tests
  it("calculates current streak for daily habits", () => {
    const habit = createHabit({
      frequency: "Daily",
      completionDates: ["2024-12-09", "2024-12-10", "2024-12-11"], // Consecutive dates
    });

    expect(calculateCurrentStreak(habit)).toBe(3);
  });

  it("calculates current streak for weekly habits", () => {
    const habit = createHabit({
      frequency: "Weekly",
      completionDates: ["2024-11-27", "2024-12-04", "2024-12-11"], // Consecutive weeks
    });

    expect(calculateCurrentStreak(habit)).toBe(3);
  });

  it("calculates current streak for monthly habits", () => {
    const habit = createHabit({
      frequency: "Monthly",
      completionDates: ["2024-10-10", "2024-11-10", "2024-12-11"], // Consecutive months
    });

    expect(calculateCurrentStreak(habit)).toBe(3);
  });

  it("calculates current streak for custom habits", () => {
    const habit = createHabit({
      frequency: "Custom",
      customDays: [1, 3, 5], // Monday, Wednesday, Friday
      completionDates: ["2024-12-09", "2024-12-11", "2024-12-13"], // Matches custom days
    });

    expect(calculateCurrentStreak(habit)).toBe(3);
  });

  // Best Streak Tests
  it("calculates best streak for daily habits", () => {
    const habit = createHabit({
      frequency: "Daily",
      completionDates: ["2024-12-01", "2024-12-02", "2024-12-05", "2024-12-06", "2024-12-07"],
    });

    expect(calculateBestStreak(habit)).toBe(3);
  });

  it("calculates best streak for weekly habits", () => {
    const habit = createHabit({
      frequency: "Weekly",
      completionDates: ["2024-11-13", "2024-11-20", "2024-12-04", "2024-12-11"], // Gaps in between
    });

    expect(calculateBestStreak(habit)).toBe(2);
  });

  it("calculates best streak for monthly habits", () => {
    const habit = createHabit({
      frequency: "Monthly",
      completionDates: ["2024-09-10", "2024-10-10", "2024-12-10"], // Gap in November
    });

    expect(calculateBestStreak(habit)).toBe(2);
  });

  it("calculates best streak for custom habits", () => {
    const habit = createHabit({
      frequency: "Custom",
      customDays: [1, 3, 5],
      completionDates: ["2024-12-04", "2024-12-06", "2024-12-11", "2024-12-13"], // Streaks separated
    });

    expect(calculateBestStreak(habit)).toBe(2);
  });

  // Weekly Completion Rate Tests
  it("calculates weekly completion rate for daily habits", () => {
    const habit = createHabit({
      frequency: "Daily",
      completionDates: ["2024-12-09", "2024-12-10", "2024-12-11"], // 3 days completed this week
    });

    expect(calculateWeeklyCompletionRate(habit)).toBe(43); // 3 out of 7 days
  });

  it("calculates weekly completion rate for weekly habits", () => {
    const habit = createHabit({
      frequency: "Weekly",
      completionDates: ["2024-12-10"], // 1 completion this week
    });

    expect(calculateWeeklyCompletionRate(habit)).toBe(100);
  });

  it("calculates weekly completion rate for custom habits", () => {
    const habit = createHabit({
      frequency: "Custom",
      customDays: [1, 3, 5],
      completionDates: ["2024-12-11"], // Only 1 custom day completed this week
    });

    expect(calculateWeeklyCompletionRate(habit)).toBe(33); // 1 out of 3 days
  });

  // Weekly Consistency Tests
  it("calculates weekly consistency for daily habits", () => {
    const habit = createHabit({
      frequency: "Daily",
      completionDates: ["2024-12-04", "2024-12-05", "2024-12-11"], // Consistent weeks
    });

    expect(calculateWeeklyConsistency(habit)).toBe(2);
  });

  it("calculates weekly consistency for weekly habits", () => {
    const habit = createHabit({
      frequency: "Weekly",
      completionDates: ["2024-12-04", "2024-11-27"], // 2 consistent weeks
    });

    expect(calculateWeeklyConsistency(habit)).toBe(2);
  });

  it("calculates weekly consistency for custom habits", () => {
    const habit = createHabit({
      frequency: "Custom",
      customDays: [1, 3, 5],
      completionDates: ["2024-12-04", "2024-12-06", "2024-11-29"], // Consistent custom weeks
    });

    expect(calculateWeeklyConsistency(habit)).toBe(2);
  });

  // Monthly Completion Rate Tests
  it("calculates monthly completion rate for daily habits", () => {
    const habit = createHabit({
      frequency: "Daily",
      completionDates: ["2024-12-01", "2024-12-02", "2024-12-10", "2024-12-11"], // 4 completions
      startDate: "2024-12-01",
    });

    expect(calculateMonthlyCompletionRate(habit)).toBe(13); // 4 out of 31 days
  });

  it("calculates monthly completion rate for weekly habits", () => {
    const habit = createHabit({
      frequency: "Weekly",
      completionDates: ["2024-12-03", "2024-12-10"], // 2 completions
      startDate: "2024-12-03",
    });

    expect(calculateMonthlyCompletionRate(habit)).toBe(40); // 2 out of 5 expected weeks
  });



  it("calculates monthly completion rate for monthly habits with a completion", () => {
    const habit = createHabit({
      frequency: "Monthly",
      completionDates: ["2024-12-05"], // Completed this month
      startDate: "2024-12-01",
    });

    expect(calculateMonthlyCompletionRate(habit)).toBe(100); // Completion exists
  });

  it("calculates monthly completion rate for monthly habits with no completion", () => {
    const habit = createHabit({
      frequency: "Monthly",
      completionDates: [], // No completions
      startDate: "2024-12-01",
    });

    expect(calculateMonthlyCompletionRate(habit)).toBe(0); // No completion
  });


  it("calculates monthly completion rate for custom habits", () => {
    const habit = createHabit({
      frequency: "Custom",
      customDays: [2, 4], // Tuesdays and Thursdays
      completionDates: ["2024-12-03", "2024-12-05"], // 2 completions
      startDate: "2024-12-01",
    });

    expect(calculateMonthlyCompletionRate(habit)).toBe(22); // 2 out of 9 expected custom days
  });

  // Monthly Consistency Tests
  it("calculates monthly consistency for daily habits", () => {
    const habit = createHabit({
      frequency: "Daily",
      completionDates: ["2024-12-11", "2024-11-11", "2024-10-11"], // Consistent months
    });

    expect(calculateMonthlyConsistency(habit)).toBe(3);
  });

  it("calculates monthly consistency for weekly habits", () => {
    const habit = createHabit({
      frequency: "Weekly",
      completionDates: ["2024-12-11", "2024-11-10", "2024-10-10"], // Consistent months
    });

    expect(calculateMonthlyConsistency(habit)).toBe(3);
  });

  it("calculates monthly consistency for custom habits", () => {
    const habit = createHabit({
      frequency: "Custom",
      customDays: [1, 3, 5],
      completionDates: ["2024-12-09", "2024-11-10", "2024-10-09"], // Matches custom days
    });

    expect(calculateMonthlyConsistency(habit)).toBe(3);
  });



});
