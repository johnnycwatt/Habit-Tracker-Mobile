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

const ProgressScreen = () => {
  const route =useRoute<RouteProp<{ params: { habit: Habit } },"params">>();
  const { habit } = route.params;

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyCompletionRate, setWeeklyCompletionRate] = useState(0);
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0);
  const [weeklyConsistency, setWeeklyConsistency] = useState(0);
  const [monthlyConsistency, setMonthlyConsistency] = useState(0);

  useEffect(() => {
    // Calculate stats
    setCurrentStreak(calculateCurrentStreak(habit));
    setBestStreak(calculateBestStreak(habit));
    setWeeklyCompletionRate(calculateWeeklyCompletionRate(habit));
    setMonthlyCompletionRate(calculateMonthlyCompletionRate(habit));
    setWeeklyConsistency(calculateWeeklyConsistency(habit));
    setMonthlyConsistency(calculateMonthlyConsistency(habit));
  }, [habit]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{habit.name}</Text>

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
});

export default ProgressScreen;
