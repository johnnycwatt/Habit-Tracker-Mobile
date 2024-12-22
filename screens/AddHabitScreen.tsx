import React, { useState } from 'react';
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
  Platform,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { addHabit, getHabits } from '../database/habits';
import { useTheme } from "../src/context/themeContext";

const isTablet = Dimensions.get('window').width >= 768;

const AddHabitScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [customDays, setCustomDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const isDuplicateHabit = async (habitName) => {
    const habits = await getHabits();
    return habits.some((habit) => habit.name.toLowerCase() === habitName.toLowerCase());
  };

  const handleAddHabit = async () => {
    if (!name.trim()) {
      setNotification({ message: 'Name is required!', type: 'error' });
      return;
    }

    const duplicate = await isDuplicateHabit(name);
    if (duplicate) {
      setNotification({ message: 'Habit with this name already exists!', type: 'error' });
      return;
    }

    const selectedCustomDays = Object.keys(customDays).filter(
      (day) => customDays[day]
    );

    if (frequency === 'Custom' && selectedCustomDays.length === 0) {
      setNotification({
        message: 'Please select at least one day for Custom frequency.',
        type: 'error',
      });
      return;
    }

    const newHabit = {
      name,
      startDate: startDate.toLocaleDateString('en-CA'), // YYYY-MM-DD
      frequency,
      customDays: frequency === "Custom" ? selectedCustomDays : null,
      color: theme.colors.card,
    };

    try {
      await addHabit(newHabit);
      setNotification({ message: 'Habit added successfully!', type: 'success' });

      // Reset state
      setTimeout(() => {
        setName('');
        setFrequency('Daily');
        setStartDate(new Date());
        setCustomDays({
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        });
        setNotification({ message: '', type: '' });
      }, 1500);
    } catch (error) {
      console.error('Error adding habit:', error);
      setNotification({ message: 'Failed to add habit. Please try again.', type: 'error' });
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
      {notification.message && (
        <Text
          style={[
            styles.notification,
            notification.type === 'success' ? styles.success : styles.error,
          ]}
        >
          {notification.message}
        </Text>
      )}

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

      <Text style={[styles.label, { color: theme.colors.text }]}>Frequency:</Text>
      <TouchableOpacity
        style={[
          styles.input,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.primary },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.colors.text }}>{frequency}</Text>
      </TouchableOpacity>

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

      {frequency === "Custom" && (
        <View style={styles.customDaysContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Select Custom Days:</Text>
          {Object.keys(customDays).map((day) => (
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
              <Text style={[styles.customDayText, { color: theme.colors.text }]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.label, { color: theme.colors.text }]}>Start Date:</Text>
      <TouchableOpacity
        style={[
          styles.dateInput,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.primary },
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: theme.colors.text }}>
          {startDate.toLocaleDateString("en-CA", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
          themeVariant={theme.mode === "dark" ? "dark" : "light"}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
        <Text style={styles.addButtonText}>Add Habit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
  container: {
      flexGrow: 1,
      padding: 16
      },
  notification: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 16,
      padding: 8,
      borderRadius: 8
      },
  label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: isTablet ? 16 : 0
      },
  input: {
      borderWidth: 1,
      padding: isTablet ? 20: 12,
      marginBottom: 16,
      borderRadius: 8,
      },
  modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)"
      },
  modalContainer: {
      width: "80%",
      borderRadius: 8,
      padding: 16
      },
  modalItem: {
      padding: isTablet ? 30 : 16,
      marginVertical: 8,
      backgroundColor: theme.mode === 'dark' ? "#333" : "#f0f0f0",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
      },
  modalItemText: {
      fontSize: isTablet ? 20 : 16,
      textAlign: "center",
      color: theme.mode === 'dark' ? "#fff" : "#333",
      },
  customDaysContainer: {
      marginBottom: 16,
      paddingTop: isTablet ? 16 : 0
      },
  customDayTouchable: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 30 : 8
      },
  customDayText: {
      marginLeft: 8,
      fontSize: 16
      },
  success: {
      color: "#2e7d32",
      backgroundColor: "#e8f5e9"
      },
  error: {
      color: "#d32f2f",
      backgroundColor: "#ffebee"
      },
  addButton: {
      backgroundColor: "#e0f7fa",
      borderWidth: 1,
      borderColor: "#0288d1",
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center", marginTop: 16 },
  addButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#0288d1" },
  dateInput: {
      borderWidth: 1,
      paddingVertical: isTablet ? 20: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 16,
      minHeight: 44,
      justifyContent: "center" },
});

export default AddHabitScreen;
