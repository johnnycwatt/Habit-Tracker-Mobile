import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../src/context/themeContext";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const { toggleTheme, theme } = useTheme();
  const navigation = useNavigation();

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
        onPress={toggleTheme}
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
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Backup Data
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingOption, { backgroundColor: theme.colors.card }]}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Restore Data
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
