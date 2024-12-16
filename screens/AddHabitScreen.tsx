import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addHabit } from '../database/habits';
import { useTheme } from "../src/context/themeContext";

const AddHabitScreen = () => {
  const {theme} = useTheme();
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
  const [notification, setNotification] = useState({ message: '',type: '' });
  const navigation = useNavigation();

  const handleAddHabit = async () => {
    if (!name.trim()) {
      setNotification({ message: 'Name is required!', type: 'error' });
      return;
    }

    const selectedCustomDays = Object.keys(customDays).filter(
      (day) => customDays[day]
    );

    if (frequency === 'Custom' &&selectedCustomDays.length === 0) {
      setNotification({
        message: 'Please select at least one day for Custom frequency.',
        type: 'error',
      });
      return;
    }

    const newHabit = {
      name,
      startDate: startDate.toISOString().split("T")[0], //YYYY-MM-DD
      frequency,
      customDays: frequency === "Custom" ? selectedCustomDays : null,
      color: theme.colors.card,
    };

    try {
      await addHabit(newHabit); // Save to AsyncStorage
      setNotification({ message: 'Habit added successfully!', type: 'success' });
      setTimeout(() => {
        //navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error adding habit:', error);
      setNotification({ message: 'Failed to add habit. Please try again.', type: 'error' });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Notification Message */}
      {notification.message ? (
        <Text
          style={[
            styles.notification,
            notification.type ==='success' ? styles.success : styles.error,
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
          {Object.keys(customDays).map((day) => (
            <View key={day} style={styles.customDay}>
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
            </View>
          ))}
        </View>
      )}

      {/* Start Date Selector */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Start Date:
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: theme.colors.text }}>
          {startDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {/* Add Habit Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
        <Text style={styles.addButtonText}>Add Habit</Text>
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
    alignItems: "center",
    marginBottom: 8,
  },
  customDayText: {
    marginLeft: 8,
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
  addButton: {
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    borderColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
  },
});

export default AddHabitScreen;
