import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getHabits, deleteHabit, updateHabit } from "../database/habits";
import { useTheme } from "../src/context/themeContext";
import {
  calculateCurrentStreak,
  calculateBestStreak,
} from "../src/utils/habitStats";

const HabitListScreen = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = useNavigation();
  const { theme } = useTheme();

  // Fetch and update habits with calculated stats
  useFocusEffect(
    React.useCallback(() => {
      const fetchHabits = async () => {
        const data = await getHabits();
        const updatedHabits = data.map((habit) => ({
          ...habit,
          currentStreak: calculateCurrentStreak(habit),
          bestStreak: calculateBestStreak(habit),
        }));
        setHabits(updatedHabits);
        setFilteredHabits(updatedHabits);
      };

      fetchHabits();
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredHabits(habits); // Show all habits if query is empty
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered= habits.filter((habit) =>
        habit.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredHabits(filtered);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleMarkComplete = async (habitName) => {
    try {
      const habit = habits.find((h) => h.name === habitName);
      const today = new Date().toLocaleDateString("en-CA");

      if (habit.completionDates.includes(today)) {
        showNotification("Habit already marked complete today!", "error");
        return;
      }

      // Update completion dates and streaks
      const updatedCompletionDates = [...habit.completionDates, today];
      const updatedCurrentStreak = calculateCurrentStreak({
        ...habit,
        completionDates: updatedCompletionDates,
      });
      const updatedBestStreak = Math.max(habit.bestStreak, updatedCurrentStreak);

      await updateHabit(habitName, {
        completionDates: updatedCompletionDates,
        currentStreak: updatedCurrentStreak,
        bestStreak: updatedBestStreak,
      });

      showNotification(`"${habitName}" marked as complete!`, "success");
      refreshHabits();
      setModalVisible(false);
    } catch (error) {
      console.error("Error marking habit as complete:", error);
    }
  };

  const handleDeleteClick = (habitName) => {
    setSelectedHabit(habitName);
    setConfirmDeleteModalVisible(true);
    setModalVisible(false);
  };


  const handleDeleteHabit = async (habitName) => {
    try {
      await deleteHabit(habitName);
      showNotification(`"${habitName}" deleted successfully!`, "success");
      refreshHabits();
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

const refreshHabits = async () => {
  const data = await getHabits();
  const updatedHabits = data.map((habit) => ({
    ...habit,
    currentStreak: calculateCurrentStreak(habit),
    bestStreak: calculateBestStreak(habit),
  }));

  setHabits(updatedHabits);


  if (searchQuery.trim() === "") {
    setFilteredHabits(updatedHabits);
  } else {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = updatedHabits.filter((habit) =>
      habit.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredHabits(filtered);
  }
};

const formatCustomDays = (days) => {
  if (!days || days.length === 0) return "No days selected";

  const correctOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedDays = days.sort((a, b) => correctOrder.indexOf(a) - correctOrder.indexOf(b));
  return sortedDays.map((day) => day.slice(0, 3)).join(", ");
};


  const renderHabit = ({ item }) => (

    <TouchableOpacity
      style={[styles.habitCard, { backgroundColor: theme.colors.card }]}
      onPress={() => {
        setSelectedHabit(item);
        setModalVisible(true);
      }}
    >
      <Text style={[styles.habitName, { color: theme.colors.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.habitDetails, { color: theme.colors.text }]}>
        Frequency:{" "}
        {item.frequency === "Custom"
          ? formatCustomDays(item.customDays)
          : item.frequency}
      </Text>
      <Text style={[styles.habitDetails, { color: theme.colors.text }]}>
        Streak: {item.currentStreak} days
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <TextInput
        style={[styles.searchBar, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
        placeholder="Search habits..."
        placeholderTextColor={theme.colors.text}
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {/* Notification Message */}
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

      {/* Habits List */}
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.name}
        renderItem={renderHabit}
        ListEmptyComponent={
          habits.length === 0 ? (
            <Text style={[styles.emptyMessage, { color: theme.colors.text }]}>
              You haven't added any habits yet! Start by creating your first habit.
            </Text>
          ) : (
            <Text style={[styles.emptyMessage, { color: theme.colors.text }]}>
              No habits match your search. Try a different keyword or add a new habit!
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddHabit")}
      >
        <Text style={styles.addButtonText}>Add a New Habit</Text>
      </TouchableOpacity>
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmDeleteModalVisible}
          onRequestClose={() => setConfirmDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Confirm Deletion
              </Text>
              <Text style={[styles.modalMessage, { color: theme.colors.text }]}>
                Are you sure you would like to delete "{selectedHabit}"? This can't be undone.
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={async () => {
                  await handleDeleteHabit(selectedHabit);
                  setConfirmDeleteModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
                  navigation.navigate("ProgressScreen", { habit: selectedHabit });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.viewProgressButtonText}>View Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={() => {
                  navigation.navigate("EditHabit", { habit: selectedHabit });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleDeleteClick(selectedHabit.name)}
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
  searchBar: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
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

  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
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
    paddingVertical: 20,
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
    fontSize: 16,
    color: '#0288d1',
  },

  viewProgressButton: {
    backgroundColor: '#f3e5f5', // Light purple background
    borderColor: '#ab47bc', // Border color (darker purple)
    borderWidth: 1,
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
