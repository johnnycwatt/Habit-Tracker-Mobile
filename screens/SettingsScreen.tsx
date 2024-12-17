import React, { useState, useEffect} from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Switch, Modal } from "react-native";
import { useTheme } from "../src/context/themeContext";
import { useNavigation } from "@react-navigation/native";
import { exportToCSV} from "../src/utils/csvManager";
import { requestNotificationPermissions, scheduleNotification } from "../src/utils/notificationManager";
import { getHabits, updateHabitReminder } from "../database/habits";
import { isHabitDueToday } from "../src/utils/habitScheduler";

const SettingsScreen = () => {
  const { toggleTheme, theme } = useTheme();
  const navigation = useNavigation();
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [modalVisible, setModalVisible] = useState(false);

  const openHelpGuide = () => {
      const url = "https://johnnycwatt.github.io/Habit-Tracker-Mobile/help-guide.html";
      Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      const storedHabits = await getHabits();
      const habitsWithReminders = storedHabits.map((habit) => ({
        ...habit,
        reminderEnabled: habit.reminderEnabled || false,
      }));
      setHabits(habitsWithReminders);
    };

    fetchHabits();
    requestNotificationPermissions();
  }, []);

const toggleReminder = async (index: number) => {
  const updatedHabits = [...habits];
  updatedHabits[index].reminderEnabled = !updatedHabits[index].reminderEnabled;

  setHabits(updatedHabits);

  await updateHabitReminder(
    updatedHabits[index].name,
    updatedHabits[index].reminderEnabled
  );

  if (updatedHabits[index].reminderEnabled) {
    const today = new Date();
    const habit = updatedHabits[index];

    if (isHabitDueToday(habit)) {
      const time = new Date();
      time.setHours(10, 0);
      await scheduleNotification(habit.name, time);
      console.log(`Scheduled reminder for: ${habit.name}`);
    } else {
      console.log(`${habit.name} is not due today. Notification skipped.`);
    }
  }
};


  const handleToggleTheme = () => {
    toggleTheme();
    setNotification({
      message: theme.colors.background === "#f8f9fa" ? "Dark Mode Enabled" : "Dark Mode Disabled",
      type: "success",
    });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleExport = async () => {
    const result = await exportToCSV();
    setNotification({
      message: result.message,
      type: result.success ? "success" : "error",
    });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      {/* Toggle Dark Mode */}
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
        onPress={handleToggleTheme}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          {theme.colors.background === "#f8f9fa"
            ? "Enable Dark Mode"
            : "Disable Dark Mode"}
        </Text>
      </TouchableOpacity>

      {/* Reminder Settings */}
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Reminders
        </Text>
      </TouchableOpacity>

      {/* Modal for Habit Reminders */}
      {/* Modal for Habit Reminders */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Manage Habit Reminders
            </Text>
            {habits.map((habit, index) => (
              <View key={index} style={styles.habitRow}>
                <Text style={[styles.habitName, { color: theme.colors.text }]}>
                  {habit.name}
                </Text>
                <Switch
                  value={habit.reminderEnabled}
                  onValueChange={() => toggleReminder(index)}
                  thumbColor={
                    habit.reminderEnabled ? theme.colors.primary : "#f4f3f4"
                  }
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Other Settings */}
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
        onPress={handleExport}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>Export to CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
        onPress={openHelpGuide}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Help and FAQs
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate("PrivacyPolicy")}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Privacy Policy
        </Text>
      </TouchableOpacity>

      {/* Notification Message */}
      {notification.message ? (
        <Text
          style={[
            styles.notification,
            notification.type === "success" ? styles.success : styles.error,
          ]}
        >
          {notification.message}
        </Text>
      ) : null}
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
  notification: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  success: {
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
  },
  error: {
    color: "#d32f2f",
    backgroundColor: "#ffebee",
  },
  settingOption: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  habitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  habitName: { fontSize: 16 },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { fontSize: 16, fontWeight: "bold" },
});

export default SettingsScreen;
