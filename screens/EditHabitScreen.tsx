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
import { useNavigation, useRoute } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { updateHabit } from '../database/habits';

const EditHabitScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params; // Retrieve the habit passed from the HabitListScreen

  const [name, setName] = useState(habit.name);
  const [frequency, setFrequency] = useState(habit.frequency);
  const [customDays, setCustomDays] = useState(
    habit.customDays ? habit.customDays.reduce((acc, day) => ({ ...acc, [day]: true }), {}) : {}
  );
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      setNotification({ message: 'Name is required!', type: 'error' });
      return;
    }

    const selectedCustomDays = Object.keys(customDays).filter((day) => customDays[day]);
    if (frequency === 'Custom' && selectedCustomDays.length === 0) {
      setNotification({
        message: 'Please select at least one day for Custom frequency.',
        type: 'error',
      });
      return;
    }

    const updatedHabit = {
      name,
      frequency,
      customDays: frequency === 'Custom' ? selectedCustomDays : null,
    };

    try {
      await updateHabit(habit.name, updatedHabit);
      setNotification({ message: 'Habit updated successfully!', type: 'success' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Error updating habit:', error);
      setNotification({ message: 'Failed to update habit.', type: 'error' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
            (day) => (
              <View key={day} style={styles.customDay}>
                <Text style={styles.customDayText}>{day}</Text>
                <Switch
                  value={customDays[day]}
                  onValueChange={(newValue) =>
                    setCustomDays({ ...customDays, [day]: newValue })
                  }
                />
              </View>
            )
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customDayText: {
    fontSize: 16,
    color: '#333',
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
