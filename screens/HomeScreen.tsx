import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      {/* Habit Tracker Icon */}
      <Image
        source={require('../assets/images/habitTrackerIcon.png')}
        style={styles.icon}
      />

      {/* Title */}
      <Text style={styles.title}>Habit Tracker</Text>

      {/* Add Habit Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Text style={styles.buttonText}>Add a New Habit</Text>
      </TouchableOpacity>

      {/* View Habits Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('HabitList')}
      >
        <Text style={styles.buttonText}>View Habits</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
    width: '80%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
  },
});

export default HomeScreen;
