import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getHabits, deleteHabit, updateHabit } from '../database/habits';
import { useTheme } from "../src/context/themeContext";

const HabitListScreen = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Fetch habits from AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      const fetchHabits = async () => {
        const data = await getHabits();
        setHabits(data);
      };

      fetchHabits();
    }, [])
  );

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleMarkComplete = async (habitName) => {
    try {
      const habit = habits.find((h) => h.name === habitName);
      const today = new Date().toLocaleDateString('en-CA');

      if (habit.completionDates.includes(today)) {
        showNotification('Habit already marked complete today!', 'error');
        return;
      }

      // Update completion dates and streaks
      const updatedCompletionDates = [...habit.completionDates, today];
      const updatedCurrentStreak = calculateCurrentStreak(updatedCompletionDates);
      const updatedBestStreak = Math.max(habit.bestStreak, updatedCurrentStreak);

      await updateHabit(habitName, {
        completionDates: updatedCompletionDates,
        currentStreak: updatedCurrentStreak,
        bestStreak: updatedBestStreak,
      });

      showNotification(`"${habitName}" marked as complete!`, 'success');
      refreshHabits();
      setModalVisible(false);
    } catch (error) {
      console.error('Error marking habit as complete:', error);
    }
  };

  const handleDeleteHabit = async (habitName) => {
    try {
      await deleteHabit(habitName);
      showNotification(`"${habitName}" deleted successfully!`, 'success');
      refreshHabits();
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const refreshHabits = async () => {
    const data = await getHabits();
    setHabits(data);
  };

  const calculateCurrentStreak = (completionDates) => {
    const sortedDates = [...completionDates].sort();
    let streak = 1;

    for (let i = sortedDates.length - 1; i > 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);

      const diffInDays = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
      if (diffInDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const renderHabit = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.habitCard,
        { backgroundColor: theme.colors.card },
      ]}
      onPress={() => {
        setSelectedHabit(item);
        setModalVisible(true);
      }}
    >
      <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.name}</Text>
      <Text style={[styles.habitDetails, { color: theme.colors.text }]}>
        Frequency: {item.frequency}
      </Text>
      <Text style={[styles.habitDetails, { color: theme.colors.text }]}>
        Streak: {item.currentStreak} days
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Notification Message */}
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

      <FlatList
        data={habits}
        keyExtractor={(item) => item.name}
        renderItem={renderHabit}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No habits added yet!</Text>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Text style={styles.addButtonText}>Add a New Habit</Text>
      </TouchableOpacity>

      {/* Custom Modal */}
      {selectedHabit && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {selectedHabit.name}
              </Text>
              <Text style={[styles.modalMessage, { color: theme.colors.text }]}>
                What would you like to do?
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, styles.completeButton]}
                onPress={() => handleMarkComplete(selectedHabit.name)}
              >
                <Text style={styles.modalButtonText}>Mark Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.viewProgressButton]}
                onPress={() => {
                  navigation.navigate('ProgressScreen', { habit: selectedHabit });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.viewProgressButtonText}>View Progress</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={() => {
                  navigation.navigate('EditHabit', { habit: selectedHabit });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleDeleteHabit(selectedHabit.name)}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 16,
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
  habitCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  habitDetails: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#e0f7fa',
    borderColor: '#0288d1',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    marginTop: 10,
    height: 48,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#0288d1',
  },

  viewProgressButton: {
    backgroundColor: '#f3e5f5', // Light purple background
    borderColor: '#ab47bc', // Border color (darker purple)
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  viewProgressButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default HabitListScreen;
