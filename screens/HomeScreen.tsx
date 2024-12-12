import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getHabits } from '../database/habits';

const HomeScreen = () => {
  const [habitsDueToday, setHabitsDueToday] = useState([]);
  const navigation = useNavigation();

  const fetchHabitsDueToday = async () => {
    const allHabits = await getHabits();
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', {weekday:'long'});
    const dayOfMonth = today.getDate();
    const todayDate = today.toISOString().split('T')[0]; //YYYY-MM-DD

    const dueToday = allHabits.map((habit) => {
      const habitStartDate = new Date(habit.startDate);
      const habitDayOfWeek = habitStartDate.toLocaleDateString('en-US', {weekday:'long'});
      const habitDayOfMonth = habitStartDate.getDate();

      // is habit due today?
      let isDueToday = false;
      switch (habit.frequency) {
        case 'Daily':
          isDueToday = true;
          break;
        case 'Weekly':
          isDueToday = habitDayOfWeek === dayOfWeek;
          break;
        case 'Monthly':
          isDueToday = habitDayOfMonth === dayOfMonth;
          break;
        case 'Custom':
          isDueToday = habit.customDays?.includes(dayOfWeek);
          break;
        default:
          isDueToday = false;
      }
      //Habits with start date pass todays date always false
      if (habitStartDate > today) return false;

      // Check if the habit has been completed today
      const isCompleted = habit.completionDates?.includes(todayDate);

      return { ...habit, isDueToday, isCompleted };
    });
    setHabitsDueToday(dueToday.filter((habit) => habit.isDueToday));
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHabitsDueToday();
    }, [])
  );

  const handleRefresh = async () => {
    await fetchHabitsDueToday();
  };

  const renderHabitItem = ({ item }) => (
    <View
      style={[
        styles.habitCard,
        item.isCompleted ? styles.completedHabitCard : null,
      ]}
    >
      <Text style={styles.habitName}>{item.name}</Text>
      <Text style={styles.habitDetails}>Frequency: {item.frequency}</Text>
      {item.isCompleted && (
        <Text style={styles.completedText}>✔ Completed</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Habit Tracker Icon */}
      <Image
        source={require('../assets/images/habitTrackerIcon.png')}
        style={styles.icon}
      />

      {/* Habits Due Today Section */}
      <Text style={styles.subtitle}>Habits Due Today</Text>
      {habitsDueToday.length > 0 ? (
        <FlatList
          data={habitsDueToday} // Limit to 3 habits
          keyExtractor={(item) => item.name}
          renderItem={renderHabitItem}
          style={styles.habitsList}
        />
      ) : (
        <Text style={styles.noHabitsText}>No habits due today!</Text>
      )}

      {/* Add Habit Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('AddHabit');
          handleRefresh();
        }}
      >
        <Text style={styles.buttonText}>Add a New Habit</Text>
      </TouchableOpacity>

      {/* View Habits Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('HabitList');
          handleRefresh();
        }}
      >
        <Text style={styles.buttonText}>View Habits</Text>
      </TouchableOpacity>

      {/* Reports Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('ReportScreen');
          handleRefresh();
        }}
      >
        <Text style={styles.buttonText}>View Reports</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 10,
    textAlign: 'center',
  },
  habitsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  habitCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedHabitCard: {
    backgroundColor: '#d4edda',
    borderColor: '#155724',
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  habitDetails: {
    fontSize: 16,
    color: '#666',
  },
  completedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginTop: 5,
  },
  noHabitsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    borderColor: '#0288d1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
  },
});

export default HomeScreen;
