import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
  calculateWeeklyConsistency,
  calculateMonthlyConsistency,
} from "../src/utils/habitStats";
import { Habit } from "../database/habit";
import { Calendar } from "react-native-calendars";

const ProgressScreen = () => {
  const route = useRoute<RouteProp<{ params: { habit: Habit } }, "params">>();
  const { habit } = route.params;

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyCompletionRate, setWeeklyCompletionRate] = useState(0);
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0);
  const [weeklyConsistency, setWeeklyConsistency] = useState(0);
  const [monthlyConsistency, setMonthlyConsistency] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // Calculate stats
    setCurrentStreak(calculateCurrentStreak(habit));
    setBestStreak(calculateBestStreak(habit));
    setWeeklyCompletionRate(calculateWeeklyCompletionRate(habit));
    setMonthlyCompletionRate(calculateMonthlyCompletionRate(habit));
    setWeeklyConsistency(calculateWeeklyConsistency(habit));
    setMonthlyConsistency(calculateMonthlyConsistency(habit));
  }, [habit]);

  const formatCompletionDates = (dates: string[]) => {
    const today = new Date().toISOString().split("T")[0];
    const formatted: { [key: string]: { selected: boolean; selectedColor: string } } = {};

    dates.forEach((date) => {
      const formattedDate = new Date(date).toISOString().split("T")[0];
      formatted[formattedDate] = { selected: true, selectedColor: "#90EE90" }; // Light green for completed dates
    });

    // Highlight today if not completed
    if (!formatted[today]) {
      formatted[today] = { selected: true, selectedColor: "#ADD8E6" }; // Light blue for today
    }

    return formatted;
  };

  const filteredCompletionDates = habit.completionDates.filter((date) => {
    const completionDate = new Date(date);
    return (
      completionDate.getFullYear() === currentMonth.getFullYear() &&
      completionDate.getMonth() === currentMonth.getMonth()
    );
  });

  const markedDates = formatCompletionDates(filteredCompletionDates);

  //maxDate
  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];

  const isCurrentMonth =
    currentMonth.getFullYear() === new Date().getFullYear() &&
    currentMonth.getMonth() === new Date().getMonth();


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{habit.name}</Text>

      {/* Calendar Section */}
      <Text style={styles.calendarTitle}>Completions</Text>
      <Calendar
        current={currentMonth.toISOString().split("T")[0]}
        markedDates={markedDates}
        maxDate={maxDate} //grey out future days
        disableArrowRight={isCurrentMonth} //prevent navigation to future months
        theme={{
          selectedDayBackgroundColor: "#ADD8E6", // Light blue for today
          todayTextColor: "red",
          arrowColor: "black",
        }}

        onMonthChange={(month) => {
          setCurrentMonth(new Date(month.year, month.month - 1));
        }}
      />


      <Text style={styles.calendarTitle}>Habit Statistics</Text>

      {/* Stats Section */}
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Current Streak:</Text>
        <Text style={styles.statValue}>{currentStreak} days</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Best Streak:</Text>
        <Text style={styles.statValue}>{bestStreak} days</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Weekly Completion Rate:</Text>
        <Text style={styles.statValue}>{weeklyCompletionRate}%</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Monthly Completion Rate:</Text>
        <Text style={styles.statValue}>{monthlyCompletionRate}%</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Weekly Consistency:</Text>
        <Text style={styles.statValue}>{weeklyConsistency} weeks</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Monthly Consistency:</Text>
        <Text style={styles.statValue}>{monthlyConsistency} months</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statValue: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 16,
  },
});

export default ProgressScreen;
