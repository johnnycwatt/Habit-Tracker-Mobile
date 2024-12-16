import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../src/context/themeContext";

const PrivacyPolicyScreen = () => {
  const { theme } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.content, { color: theme.colors.text }]}>
        Last updated: 15/12/2024
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        Habit Tracker ("we", "our", or "us") operates the Habit Tracker mobile application (the "App").
        This Privacy Policy explains our policies regarding the collection, use, and disclosure of personal data when you use our App.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Information We Do Not Collect
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        We do not collect any personal or sensitive user data.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Data Sharing
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        We do not share any data with third parties.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Data Storage
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        The App stores all habit tracking data locally on your device. This data is not uploaded to any server and we do not have access to your data.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Third-Party Services
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        The App may use third-party libraries to improve functionality. These libraries do not access or process your personal data.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Changes to This Privacy Policy
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        We may update this Privacy Policy from time to time. You are advised to review this page periodically for any changes.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Contact Us
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        If you have any questions about this Privacy Policy, you can contact us:
      </Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        - Email: johnnycwatt@gmail.com
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default PrivacyPolicyScreen;
