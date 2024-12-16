import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { updateHabit } from "../database/habits";
import { useTheme } from "../src/context/themeContext";

const EditHabitScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params; // Retrieve the habit passed from the HabitListScreen

  const [name, setName] = useState(habit.name);
  const [frequency, setFrequency] = useState(habit.frequency);
  const [customDays, setCustomDays] = useState(
    habit.customDays
      ? habit.customDays.reduce(
          (acc, day) => ({ ...acc, [day]: true }),
          {}
        )
      : {}
  );
  const [notification, setNotification] = useState({ message: "", type: "" });

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      setNotification({ message: "Name is required!", type: "error" });
      return;
    }

    const selectedCustomDays = Object.keys(customDays).filter(
      (day) => customDays[day]
    );
    if (frequency === "Custom" && selectedCustomDays.length === 0) {
      setNotification({
        message: "Please select at least one day for Custom frequency.",
        type: "error",
      });
      return;
    }

    const updatedHabit = {
      name,
      frequency,
      customDays: frequency === "Custom" ? selectedCustomDays : null,
    };

    try {
      await updateHabit(habit.name, updatedHabit);
      setNotification({
        message: "Habit updated successfully!",
        type: "success",
      });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error("Error updating habit:", error);
      setNotification({
        message: "Failed to update habit.",
        type: "error",
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >

      {/* Notification */}
      {notification.message ? (
        <Text
          style={[
            styles.notification,
            notification.type === 'success' ? styles.success : styles.error,
          ]}
        >
          {notification.message}
        </Text>
      ) : null}


      {/* Habit Name */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.primary,
            color: theme.colors.text,
          },
        ]}
        placeholder="Habit Name"
        placeholderTextColor={theme.colors.text}
        value={name}
        onChangeText={setName}
      />

      {/* Frequency Picker */}
      <View
        style={[
          styles.pickerContainer,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.primary },
        ]}
      >
        <RNPickerSelect
          onValueChange={(value) => setFrequency(value)}
          items={[
            { label: "Daily", value: "Daily" },
            { label: "Weekly", value: "Weekly" },
            { label: "Monthly", value: "Monthly" },
            { label: "Custom", value: "Custom" },
          ]}
          value={frequency}
          style={{
            inputIOS: [styles.pickerText, { color: theme.colors.text }],
            inputAndroid: [styles.pickerText, { color: theme.colors.text }],
          }}
        />
      </View>

      {/* Custom Days Selector */}
      {frequency === "Custom" && (
        <View style={styles.customDaysContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Select Custom Days:
          </Text>
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <View key={day} style={styles.customDay}>
              <Text style={[styles.customDayText, { color: theme.colors.text }]}>
                {day}
              </Text>
              <Switch
                value={customDays[day]}
                onValueChange={(newValue) =>
                  setCustomDays({ ...customDays, [day]: newValue })
                }
                trackColor={{
                  false: theme.colors.card,
                  true: theme.colors.primary,
                }}
                thumbColor={customDays[day] ? theme.colors.card : "#f4f3f4"}
              />
            </View>
          ))}
        </View>
      )}

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  notification: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  customDaysContainer: {
    marginBottom: 16,
  },
  customDay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  customDayText: {
    fontSize: 16,
  },
  success: {
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  error: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  saveButton: {
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    borderColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
  },
});

export default EditHabitScreen;
