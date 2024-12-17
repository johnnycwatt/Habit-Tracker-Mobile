import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  calculateMonthlyCompletionRateDescending,
  calculateBestStreak,
  calculateCurrentStreak,
  calculateMonthlyConsistency,
} from "../src/utils/habitStats";
import { getHabits } from "../database/habits";
import { useTheme } from "../src/context/themeContext";

const ReportScreen = () => {
  const [habits, setHabits] = useState([]);
  const { theme } = useTheme();
  const [reportData, setReportData] = useState({
    Daily: [],
    Weekly: [],
    Monthly: [],
    Custom: [],
  });
  const [filter, setFilter] = useState("All");
  const [summary, setSummary] = useState({
    bestHabit: null,
    totalHabits: 0,
    averageCompletion: 0,
    frequentlyMissed: [],
  });

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const allHabits = await getHabits();

        const report = allHabits.map((habit) => ({
          name: habit.name,
          frequency: habit.frequency,
          monthlyCompletionRate: calculateMonthlyCompletionRateDescending(habit),
          currentStreak: calculateCurrentStreak(habit),
          bestStreak: calculateBestStreak(habit),
          monthlyConsistency: calculateMonthlyConsistency(habit),
        }));

        const groupedHabits = {
          Daily: report.filter((habit) => habit.frequency === "Daily"),
          Weekly: report.filter((habit) => habit.frequency === "Weekly"),
          Monthly: report.filter((habit) => habit.frequency === "Monthly"),
          Custom: report.filter((habit) => habit.frequency === "Custom"),
        };

        setReportData(groupedHabits);

        const totalHabits = allHabits.length;
        const averageCompletion =
          report.reduce((acc, habit) => acc + habit.monthlyCompletionRate, 0) /
          totalHabits || 0;

        const bestHabit = report.reduce((best, habit) => {
          return habit.monthlyCompletionRate > (best?.monthlyCompletionRate || 0)
            ? habit
            : best;
        }, null);

        const frequentlyMissed = report
          .filter((habit) => habit.monthlyCompletionRate < 50)
          .sort((a, b) => a.monthlyCompletionRate - b.monthlyCompletionRate)
          .slice(0, 5); // Limit to 5 habits

        setSummary({
          bestHabit,
          totalHabits,
          averageCompletion,
          frequentlyMissed,
        });
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    fetchHabits();
  }, []);

  const getBackgroundColor = (completionRate) => {
    if (completionRate >= 80) return "#90EE90"; // LightGreen - 80% and above
    if (completionRate >= 40) return "#FFFFE0"; // LightYellow - between 40% and 79%
    return "#F08080"; // LightCoral - Less then 40%
  };

  const renderGroupedHabits = () => {
    if (filter !== "All") {
      // Render filtered habits for the selected frequency
      return renderHabitSection(reportData[filter], `${filter} Habits`);
    }

    // Render all habits and then group by frequency
    return (
      <>
        {Object.keys(reportData).map((key) =>
          renderHabitSection(reportData[key], `${key} Habits`)
        )}
      </>
    );
  };

  const renderHabitSection = (habits, title) => (
    <View key={title}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {habits.length > 0 ? (
        habits.map((habit, index) => (
          <View
            key={index}
            style={[
              styles.reportCard,
              { backgroundColor: getBackgroundColor(habit.monthlyCompletionRate) },
            ]}
          >
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.stat}>
              Completion Rate: {habit.monthlyCompletionRate}%
            </Text>
            <Text style={styles.stat}>
              Current Streak: {habit.currentStreak} days
            </Text>
            <Text style={styles.stat}>
              Best Streak: {habit.bestStreak} days
            </Text>
            <Text style={styles.stat}>
              Consistency: {habit.monthlyConsistency} months
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.noData, { color: theme.colors.text }]}>
          No habits in this category.
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Summary</Text>
      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          <Text style={styles.summaryLabel}>Best Habit:</Text>{" "}
          {summary.bestHabit?.name || "N/A"} (
          {summary.bestHabit?.monthlyCompletionRate || 0}%)
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          <Text style={styles.summaryLabel}>Total Habits:</Text>{" "}
          {summary.totalHabits}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          <Text style={styles.summaryLabel}>Average Completion:</Text>{" "}
          {summary.averageCompletion.toFixed(1)}%
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          <Text style={styles.summaryLabel}>Frequently Missed:</Text>{" "}
          {summary.frequentlyMissed
            .map((habit) => `${habit.name} (${habit.monthlyCompletionRate}%)`)
            .join(", ") || "None"}
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        Habit Report
      </Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={filter}
          onValueChange={(value) => setFilter(value)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="All" />
          <Picker.Item label="Daily Habits" value="Daily" />
          <Picker.Item label="Weekly Habits" value="Weekly" />
          <Picker.Item label="Monthly Habits" value="Monthly" />
          <Picker.Item label="Custom Habits" value="Custom" />
        </Picker>
      </View>


      {renderGroupedHabits()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  dropdownContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  reportCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  stat: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  noData: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ReportScreen;
