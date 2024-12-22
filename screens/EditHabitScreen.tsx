import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateHabit } from "../database/habits";
import { useTheme } from "../src/context/themeContext";

const isTablet = Dimensions.get("window").width >= 768;

const EditHabitScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params;

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
  const [isModalVisible, setModalVisible] = useState(false);

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
    } catch (error) {
      console.error("Error updating habit:", error);
      setNotification({
        message: "Failed to update habit.",
        type: "error",
      });
    }
  };

  const handleSelectFrequency = (value) => {
    setFrequency(value);
    setModalVisible(false);
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
            notification.type === "success" ? styles.success : styles.error,
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
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Frequency:
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.colors.text }}>{frequency}</Text>
      </TouchableOpacity>

      {/* Frequency Modal */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
            <FlatList
              data={["Daily", "Weekly", "Monthly", "Custom"]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectFrequency(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
            <TouchableOpacity
              key={day}
              style={styles.customDayTouchable}
              onPress={() =>
                setCustomDays({ ...customDays, [day]: !customDays[day] })
              }
            >
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
              <Text style={[styles.customDayText, { color: theme.colors.text }]}>
                {day}
              </Text>
            </TouchableOpacity>
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

const createStyles = (theme) =>
  StyleSheet.create({
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
      padding: isTablet ? 20 : 12,
      marginBottom: 16,
      borderRadius: 8,
      fontSize: isTablet ? 20 : 16,
    },
    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      width: "80%",
      borderRadius: 8,
      padding: 16,
    },
    modalItem: {
      padding: isTablet ? 30 : 16,
      marginVertical: 8,
      backgroundColor: theme.mode === "dark" ? "#333" : "#f0f0f0",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    modalItemText: {
      fontSize: isTablet ? 20 : 16,
      textAlign: "center",
      color: theme.mode === "dark" ? "#fff" : "#333",
    },
    customDaysContainer: {
      marginBottom: 16,
      paddingTop: isTablet ? 16 : 0,
    },
    customDayTouchable: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 30 : 8,
    },
    customDayText: {
      marginLeft: 8,
      fontSize: 16,
    },
    success: {
      color: "#2e7d32",
      backgroundColor: "#e8f5e9",
    },
    error: {
      color: "#d32f2f",
      backgroundColor: "#ffebee",
    },
    saveButton: {
      backgroundColor: "#e0f7fa",
      borderWidth: 1,
      borderColor: "#0288d1",
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 16,
    },
    saveButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#0288d1",
    },
  });

export default EditHabitScreen;
