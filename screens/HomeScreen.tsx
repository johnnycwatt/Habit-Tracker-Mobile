import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getHabits } from "../database/habits";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../src/context/themeContext";
import { isHabitDueToday } from "../src/utils/habitScheduler";

const HomeScreen = () => {
  const [habitsDueToday, setHabitsDueToday] = useState([]);
  const navigation = useNavigation();
  const { theme } = useTheme();

  const fetchHabitsDueToday = async () => {
    const allHabits = await getHabits();
    const dueToday = allHabits.map((habit) => {
      const { isDueToday, isCompleted } = isHabitDueToday(habit);
      return { ...habit, isDueToday, isCompleted };
    });

    setHabitsDueToday(dueToday.filter((habit) => habit.isDueToday));
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHabitsDueToday();
    }, [])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme.colors.text]);


  const renderHabitItem = ({ item }) => (
  <TouchableOpacity
    style={[
      styles.habitCard,
      { backgroundColor: theme.colors.card },
      item.isCompleted ? { backgroundColor: theme.colors.completedCard } : null,
    ]}
    onPress={() => navigation.navigate("ProgressScreen", { habit: item })}
  >
    <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.name}</Text>
    <Text style={[styles.habitDetails, { color: theme.colors.text }]}>
      {item.isCompleted ? "✔ Completed" : "Due Today"}
    </Text>
  </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Habits Due Today Section */}
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Habits Due Today</Text>
      {habitsDueToday.length > 0 ? (
        <FlatList
          data={habitsDueToday}
          keyExtractor={(item) => item.name}
          renderItem={renderHabitItem}
          style={styles.habitsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="checkmark-done-circle-outline"
            size={50}
            color={theme.colors.text}
            style={styles.emptyStateIcon}
          />
          <Text style={[styles.noHabitsText, { color: theme.colors.text }]}>
            No habits due today!
          </Text>
        </View>
      )}

      {/* Footer Navigation Bar */}
      <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("AddHabit")}
        >
          <Ionicons name="add-circle-outline" size={28} color={theme.colors.text} />
          <Text style={[styles.footerButtonText, { color: theme.colors.text }]}>
            Add Habit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("HabitList")}
        >
          <Ionicons name="list-circle-outline" size={28} color={theme.colors.text} />
          <Text style={[styles.footerButtonText, { color: theme.colors.text }]}>
            View Habits
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("ReportScreen")}
        >
          <Ionicons name="stats-chart-outline" size={28} color={theme.colors.text} />
          <Text style={[styles.footerButtonText, { color: theme.colors.text }]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  habitsList: {
    flex: 1, // Utilize full vertical space
  },
  habitCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  habitDetails: {
    fontSize: 16,
  },
  completedText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateIcon: {
    marginBottom: 10,
  },
  noHabitsText: {
    fontSize: 16,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  footerButton: {
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  settingsIcon: {
    marginRight: 16,
  },
});

export default HomeScreen;
