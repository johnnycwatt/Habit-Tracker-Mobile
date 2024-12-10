import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a new habit
export const addHabit = async (habit) => {
  try {
    const habits = JSON.parse(await AsyncStorage.getItem('habits')) || [];

    // Check if a habit with the same name already exists
    if (habits.some((h) => h.name === habit.name)) {
      throw new Error('Habit with this name already exists');
    }

    const newHabit = {
      name: habit.name,
      startDate: habit.startDate,
      frequency: habit.frequency,
      customDays: habit.customDays || null, // Optional for custom frequencies
      completionDates: [], // Initialize completion dates as an empty array
      color: habit.color,
      currentStreak: 0, // Initialize current streak
      bestStreak: 0, // Initialize best streak
    };

    habits.push(newHabit);
    await AsyncStorage.setItem('habits', JSON.stringify(habits));
    console.log('Habit added:', newHabit);
  } catch (error) {
    console.error('Error adding habit:', error);
  }
};

// Get all habits
export const getHabits = async () => {
  try {
    const habits = JSON.parse(await AsyncStorage.getItem('habits')) || [];
    console.log('Retrieved habits:', habits);
    return habits;
  } catch (error) {
    console.error('Error retrieving habits:', error);
    return [];
  }
};

// Update a habit (e.g., to mark completion or update streaks)
export const updateHabit = async (habitName, updates) => {
  try {
    const habits = JSON.parse(await AsyncStorage.getItem('habits')) || [];
    const habitIndex = habits.findIndex((habit) => habit.name === habitName);

    if (habitIndex === -1) {
      throw new Error('Habit not found');
    }

    const habit = habits[habitIndex];

    // Apply updates (e.g., completion dates, streaks)
    habits[habitIndex] = {
      ...habit,
      ...updates,
      completionDates: updates.completionDates || habit.completionDates,
      currentStreak: updates.currentStreak || habit.currentStreak,
      bestStreak: updates.bestStreak || habit.bestStreak,
    };

    await AsyncStorage.setItem('habits', JSON.stringify(habits));
    console.log('Habit updated:', habits[habitIndex]);
  } catch (error) {
    console.error('Error updating habit:', error);
  }
};

// Delete a habit
export const deleteHabit = async (habitName) => {
  try {
    const habits = JSON.parse(await AsyncStorage.getItem('habits')) || [];
    const filteredHabits = habits.filter((habit) => habit.name !== habitName);

    await AsyncStorage.setItem('habits', JSON.stringify(filteredHabits));
    console.log('Habit deleted:', habitName);
  } catch (error) {
    console.error('Error deleting habit:', error);
  }
};
