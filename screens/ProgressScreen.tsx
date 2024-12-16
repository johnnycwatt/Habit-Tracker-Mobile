import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Habit } from "../database/habit";
import { Calendar } from "react-native-calendars";
import * as Progress from "react-native-progress";
import { BarChart, Grid, YAxis } from "react-native-svg-charts";
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
  calculateWeeklyConsistency,
  calculateMonthlyConsistency,
} from "../src/utils/habitStats";
import { useTheme } from "../src/context/themeContext";

const ProgressScreen = () => {
  const route = useRoute<RouteProp<{ params: { habit: Habit } }, "params">>();
  const { habit } = route.params;
  const { theme } = useTheme();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyCompletionRate, setWeeklyCompletionRate] = useState(0);
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0);
  const [weeklyConsistency, setWeeklyConsistency] = useState(0);
  const [monthlyConsistency, setMonthlyConsistency] = useState(0);
  const [monthlyCompletions, setMonthlyCompletions] = useState<number[]>([]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentStreak(calculateCurrentStreak(habit));
    setBestStreak(calculateBestStreak(habit));
    setWeeklyCompletionRate(calculateWeeklyCompletionRate(habit));
    setMonthlyCompletionRate(calculateMonthlyCompletionRate(habit));
    setWeeklyConsistency(calculateWeeklyConsistency(habit));
    setMonthlyConsistency(calculateMonthlyConsistency(habit));

    const completions = Array(12).fill(0);
    habit.completionDates.forEach((date) => {
      const completionDate = new Date(date);
      if (completionDate.getFullYear() === today.getFullYear()) {
        const monthIndex = completionDate.getMonth();
        completions[monthIndex]++;
      }
    });
    setMonthlyCompletions(completions);
  }, [habit]);

  const formatCompletionDates = (dates: string[]) => {
    const formatted: { [key: string]: { selected: boolean; selectedColor: string } } = {};
    const todayFormatted = today.toISOString().split("T")[0];

    dates.forEach((date) => {
      const formattedDate = new Date(date).toISOString().split("T")[0];
      formatted[formattedDate] = { selected: true, selectedColor: "#90EE90" };
    });

    if (!formatted[todayFormatted]) {
      formatted[todayFormatted] = { selected: true, selectedColor: "#ADD8E6" };
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

  const maxDate = today.toISOString().split("T")[0];
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{habit.name}</Text>

      {/* Calendar Section */}
      <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>Completions</Text>
      <Calendar
        current={currentMonth.toISOString().split("T")[0]}
        markedDates={markedDates}
        maxDate={maxDate}
        disableArrowRight={isCurrentMonth}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.text,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.card,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          textDisabledColor: theme.colors.calendarDisabledText,
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.card,
          arrowColor: theme.colors.text,
          monthTextColor: theme.colors.text,
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "bold",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        onMonthChange={(month) => {
          setCurrentMonth(new Date(month.year, month.month - 1));
        }}
      />


      {/* Habit Statistics Section */}
      <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>Habit Statistics</Text>
      <View style={styles.row}>
        <View style={[styles.statCard, styles.smallCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Current Streak</Text>
          <Text style={[styles.statValue]}>
            {currentStreak} days
          </Text>
        </View>
        <View style={[styles.statCard, styles.smallCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Best Streak</Text>
          <Text style={[styles.statValue]}>{bestStreak} days</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.circularStatCard}>
          <Progress.Circle
            size={100}
            progress={weeklyCompletionRate / 100}
            color="#76c7c0"
            unfilledColor="#e8f5e9"
            borderWidth={0}
            showsText={true}
            formatText={() => `${weeklyCompletionRate}%`}
            textStyle={{ fontSize: 16, color: theme.colors.text }}
          />
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Weekly Completion</Text>
        </View>
        <View style={styles.circularStatCard}>
          <Progress.Circle
            size={100}
            progress={monthlyCompletionRate / 100}
            color="#4caf50"
            unfilledColor="#e8f5e9"
            borderWidth={0}
            showsText={true}
            formatText={() => `${monthlyCompletionRate}%`}
            textStyle={{ fontSize: 16, color: theme.colors.text }}
          />
          <Text style={[styles.statLabel, { color: theme.colors.text }]}>Monthly Completion</Text>
        </View>
      </View>

      {/* Bar Chart for Monthly Completions history */}
      <View style={[styles.barChartContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statLabel, { color: theme.colors.text }]}>Completion History</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <YAxis
            data={monthlyCompletions}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ fontSize: 12, fill: theme.colors.text }}
            numberOfTicks={5}
            style={{ marginRight: 8 }}
          />
          <BarChart
            style={styles.barChart}
            data={monthlyCompletions}
            svg={{ fill: "#4caf50" }}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0.3}
          >
            <Grid svg={{ stroke: theme.colors.text }} />
          </BarChart>
        </View>
        <View style={styles.barChartLabels}>
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
            (month, index) => (
              <Text key={index} style={[styles.barChartLabel, { color: theme.colors.text }]}>
                {month}
              </Text>
            )
          )}
        </View>
      </View>
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
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  smallCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4caf50",
    textAlign: "center",
    marginTop: 8,
  },
  circularStatCard: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  barChartContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barChart: {
    height: 200,
    flex: 1,
    marginBottom: 16,
  },
  barChartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barChartLabel: {
    fontSize: 12,
  },
});

export default ProgressScreen;
