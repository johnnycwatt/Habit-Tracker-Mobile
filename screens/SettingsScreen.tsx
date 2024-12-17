import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from "react-native";
import { useTheme } from "../src/context/themeContext";
import { useNavigation } from "@react-navigation/native";
import { exportToCSV, importFromCSV } from "../src/utils/csvManager";

const SettingsScreen = () => {
  const { toggleTheme, theme } = useTheme();
  const navigation = useNavigation();
  const [notification, setNotification] = useState({ message: "", type: "" });

    const openHelpGuide = () => {
      const url = "https://johnnycwatt.github.io/Habit-Tracker-Mobile/help-guide.html";
      Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
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

      {/* Other Settings */}
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Reminders
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Notifications
        </Text>
      </TouchableOpacity>
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
});

export default SettingsScreen;
