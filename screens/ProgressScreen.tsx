import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Habit } from "../database/habit";
import { Calendar } from "react-native-calendars";
import * as Progress from "react-native-progress";
import CustomBarChart from "../src/utils/CustomBarChart";
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
  calculateWeeklyConsistency,
  calculateMonthlyConsistency,
} from "../src/utils/habitStats";
import { useTheme } from "../src/context/themeContext";
import { updateHabit } from "../database/habits";

const ProgressScreen = () => {
  const route = useRoute<RouteProp<{ params: { habit: Habit } }, "params">>();
  const { habit } = route.params;
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [localHabit, setLocalHabit] = useState<Habit>(habit);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyCompletionRate, setWeeklyCompletionRate] = useState(0);
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0);
  const [weeklyConsistency, setWeeklyConsistency] = useState(0);
  const [monthlyConsistency, setMonthlyConsistency] = useState(0);
  const [monthlyCompletions, setMonthlyCompletions] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    navigation.setOptions({ title: habit.name });
  }, [habit.name, navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateStats(localHabit);
  }, [localHabit]);

  const updateStats = (habit: Habit) => {
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
  };

  const formatCompletionDates = (dates: string[]) => {
    const formatted: { [key: string]: { selected: boolean; selectedColor: string } } = {};
    const todayFormatted = today.toLocaleDateString("en-CA");

    dates.forEach((date) => {
      const formattedDate = new Date(date).toLocaleDateString("en-CA");
      formatted[formattedDate] = { selected: true, selectedColor: "#90EE90" };
    });

    if (!formatted[todayFormatted]) {
      formatted[todayFormatted] = { selected: true, selectedColor: "#ADD8E6" };
    }

    return formatted;
  };

  const handleDateLongPress = (dateString: string) => {
    const selectedDate = new Date(dateString);
    const startDate = new Date(localHabit.startDate);

    if (selectedDate < startDate) {
      alert("You cannot mark a date before the habit's start date as complete.");
      return;
    }

    if (localHabit.completionDates.includes(dateString)) {
      return;
    }

    setSelectedDate(dateString);
    setModalVisible(true);
  };

  const confirmMarkComplete = async () => {
    if (!selectedDate) return;

    try {
      const updatedCompletionDates = [...localHabit.completionDates, selectedDate];
      const updatedHabit = { ...localHabit, completionDates: updatedCompletionDates };

      await updateHabit(localHabit.name, { completionDates: updatedCompletionDates });
      setLocalHabit(updatedHabit); // Update the local state
      setModalVisible(false);
    } catch (error) {
      alert("Failed to mark the date as complete.");
      console.error("Error marking date as complete:", error);
    }
  };

  const filteredCompletionDates = localHabit.completionDates.filter((date) => {
    const completionDate = new Date(date);
    return (
      completionDate.getFullYear() === currentMonth.getFullYear() &&
      completionDate.getMonth() === currentMonth.getMonth()
    );
  });

  const markedDates = formatCompletionDates(filteredCompletionDates);

    const monthLabels = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun",
      "Jul", "Aug", "Sep",
      "Oct", "Nov", "Dec",
    ];


  const maxDate = today.toLocaleDateString('en-CA');
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
    >

      {/* Calendar Section */}
      <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>Completions</Text>
      <Calendar
        current={currentMonth.toLocaleDateString('en-CA')}
        markedDates={markedDates}
        maxDate={maxDate}
        firstDay={1}
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
        onDayLongPress={(day) => handleDateLongPress(day.dateString)}
      />
      {/* Modal for Confirmation */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Mark {selectedDate} as complete?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#76c7c0" }]}
                onPress={confirmMarkComplete}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#d32f2f" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



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
      <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>
       Completion History
      </Text>
      <CustomBarChart
        data={monthlyCompletions}
        labels={monthLabels}
      />
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
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "80%",
      padding: 20,
      borderRadius: 8,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 8,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#fff",
    },
});

export default ProgressScreen;
