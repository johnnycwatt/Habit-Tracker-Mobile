import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getHabits } from "../database/habits";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../src/context/themeContext"; // Import theme context

const HomeScreen = () => {
  const [habitsDueToday, setHabitsDueToday] = useState([]);
  const navigation = useNavigation();
  const { theme } = useTheme(); // Access theme from context

  const fetchHabitsDueToday = async () => {
    const allHabits = await getHabits();
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
    const dayOfMonth = today.getDate();
    const todayDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const dueToday = allHabits.map((habit) => {
      const habitStartDate = new Date(habit.startDate);
      const habitDayOfWeek = habitStartDate.toLocaleDateString("en-US", { weekday: "long" });
      const habitDayOfMonth = habitStartDate.getDate();

      let isDueToday = false;
      switch (habit.frequency) {
        case "Daily":
          isDueToday = true;
          break;
        case "Weekly":
          isDueToday = habitDayOfWeek === dayOfWeek;
          break;
        case "Monthly":
          isDueToday = habitDayOfMonth === dayOfMonth;
          break;
        case "Custom":
          isDueToday = habit.customDays?.includes(dayOfWeek);
          break;
        default:
          isDueToday = false;
      }
      if (habitStartDate > today) return false;
      const isCompleted = habit.completionDates?.includes(todayDate);

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
    <View
      style={[
        styles.habitCard,
        { backgroundColor: theme.colors.card },
        item.isCompleted ? { backgroundColor: theme.colors.completedCard} : null,
      ]}
    >
      <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.name}</Text>
      <Text style={[styles.habitDetails, { color: theme.colors.text }]}>
        Frequency: {item.frequency}
      </Text>
      {item.isCompleted && (
        <Text style={[styles.completedText, { color: theme.colors.completedText }]}>✔ Completed</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Habit Tracker Icon */}
      <Image
        source={require("../assets/images/habitTrackerIcon.png")}
        style={styles.icon}
      />

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
        <Text style={[styles.noHabitsText, { color: theme.colors.text }]}>
          No habits due today!
        </Text>
      )}

      {/* Add Habit Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.button.backgroundColor,
            borderColor: theme.button.borderColor,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("AddHabit")}
      >
        <Text style={[styles.buttonText, { color: theme.button.textColor }]}>
          Add a New Habit
        </Text>
      </TouchableOpacity>

      {/* View Habits Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.button.backgroundColor,
            borderColor: theme.button.borderColor,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("HabitList")}
      >
        <Text style={[styles.buttonText, { color: theme.button.textColor }]}>
          View Habits
        </Text>
      </TouchableOpacity>

      {/* Reports Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.button.backgroundColor,
            borderColor: theme.button.borderColor,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("ReportScreen")}
      >
        <Text style={[styles.buttonText, { color: theme.button.textColor }]}>
          View Reports
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: "center",
    resizeMode: "contain",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  habitsList: {
    maxHeight: 200,
    marginBottom: 20,
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
  noHabitsText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    alignSelf: "center",
    width: "80%",
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsIcon: {
    marginRight: 16,
  },
});

export default HomeScreen;
