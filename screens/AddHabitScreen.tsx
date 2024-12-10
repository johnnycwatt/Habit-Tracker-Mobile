import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import { addHabit } from '../database/habits';

const AddHabitScreen = () => {
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
      startDate: startDate.toISOString().split('T')[0], //YYYY-MM-DD
      frequency,
      customDays: frequency === 'Custom' ? selectedCustomDays : null,
      color: '#ffffff',
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
    <ScrollView contentContainerStyle={styles.container}>
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
        style={styles.input}
        placeholder="Habit Name"
        value={name}
        onChangeText={setName}
      />

      {/* Frequency Picker */}
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={(value) => setFrequency(value)}
          items={[
            { label: 'Daily', value: 'Daily' },
            { label: 'Weekly', value: 'Weekly' },
            { label: 'Monthly', value: 'Monthly' },
            { label: 'Custom', value: 'Custom' },
          ]}
          value={frequency}
          style={{
            inputIOS: styles.pickerText,
            inputAndroid: styles.pickerText,
          }}
        />
      </View>

      {/* Custom Days Selector */}
      {frequency === 'Custom' && (
        <View style={styles.customDaysContainer}>
          <Text style={styles.label}>Select Custom Days:</Text>
          {Object.keys(customDays).map((day) => (
            <View key={day} style={styles.customDay}>
              <CheckBox
                value={customDays[day]}
                onValueChange={(newValue) =>
                  setCustomDays({ ...customDays,[day]: newValue })
                }
              />
              <Text style={styles.customDayText}>{day}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Start Date Selector */}
      <Text style={styles.label}>Start Date:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{startDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker &&(
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
    backgroundColor: '#f8f9fa',
  },
  notification: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  success: {
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  error: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  customDaysContainer: {
    marginBottom: 16,
  },
  customDay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customDayText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
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
