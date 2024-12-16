import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Export habits to CSV
export const exportToCSV = async () => {
  try {
    const habitsData = await AsyncStorage.getItem("habits");
    const habits = habitsData ? JSON.parse(habitsData) : [];

    let csvContent = "Name,StartDate,Frequency,CustomDays,CompletionDates\n";
    habits.forEach((habit) => {
      const customDays = habit.customDays?.join("|") || "";
      const completionDates = habit.completionDates?.join("|") || "";
      csvContent += `${habit.name},${habit.startDate},${habit.frequency},"${customDays}","${completionDates}"\n`;
    });

    const fileUri = `${FileSystem.documentDirectory}habit_backup.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    await Sharing.shareAsync(fileUri);
    return { success: true, message: "CSV exported successfully." };
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return { success: false, message: "Failed to export CSV." };
  }
};





