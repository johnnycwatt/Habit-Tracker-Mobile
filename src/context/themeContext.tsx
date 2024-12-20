import React, { createContext, useContext, useState, useEffect } from "react";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LightTheme = {
  ...DefaultTheme,
  mode: "light",
  colors: {
    ...DefaultTheme.colors,
    background: "#f8f9fa",
    primary: "#0288d1",
    text: "#333",
    card: "#fff",
    completedCard: "#d4edda",
    completedText: "#155724",
    calendarDisabledText: "#d9e1e8",
    headerStyle: "#0288d1",
  },
  button: {
    backgroundColor: "#e0f7fa",
    borderColor: "#0288d1",
    textColor: "#0288d1",
  },
};

export const DarkThemeCustom = {
  ...DarkTheme,
  mode: "dark",
  colors: {
    ...DarkTheme.colors,
    background: "#121212",
    primary: "#1e88e5",
    text: "#fff",
    card: "#1f1f1f",
    completedCard: "#155724",
    completedText: "#d4edda",
    calendarDisabledText: "rgba(255, 255, 255, 0.3)",
    headerStyle: "#0288d1",
  },
  button: {
    backgroundColor: "#e0f7fa",
    borderColor: "#0288d1",
    textColor: "#0288d1",
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(LightTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) {
          setTheme(storedTheme === "dark" ? DarkThemeCustom : LightTheme);
        }
      } catch (error) {
        console.error("Error loading theme from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === LightTheme ? DarkThemeCustom : LightTheme;
      setTheme(newTheme);
      await AsyncStorage.setItem("theme", newTheme === DarkThemeCustom ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme to AsyncStorage:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
