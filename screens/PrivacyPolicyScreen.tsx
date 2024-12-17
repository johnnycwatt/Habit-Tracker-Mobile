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
      <Text style={[styles.content, { color: theme.colors.text }]}>Last updated: 17/12/2024</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>Habit Tracker - Plan, Succeed (“we,” “our,” or “us”) operates the Habit Tracker mobile application (the “App”). This Privacy Policy explains our policies regarding the collection, use, and storage of data when you use our App.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Information We Do Not Collect</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>We do <Text style={styles.bold}>not collect, store, or process</Text> any personal or sensitive user data. All data entered into the App remains on your device.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Data Sharing</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>We do not share your data with any third parties. The App does not use any third-party tracking, analytics libraries (e.g., Google Analytics), or advertising services.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Data Storage</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>Your habit tracking data is stored locally on your device. This data is not uploaded to any server, cloud service, or external storage. We, as the developers, do not have access to your data.</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>Deleting Your Data: You can delete all app data at any time by uninstalling the App from your device.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Third-Party Services</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>While the App uses certain open-source libraries (such as for UI components and navigation), these libraries operate locally on your device and do not track, collect, or share your data externally.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Changes to This Privacy Policy</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>We may update this Privacy Policy periodically. Changes will be communicated through app updates.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Contact Us</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>If you have any questions about this Privacy Policy, please contact us:</Text>
      <Text style={[styles.content, { color: theme.colors.text }]}>- <Text style={styles.bold}>Email:</Text> johnnycwatt@gmail.com</Text>
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
