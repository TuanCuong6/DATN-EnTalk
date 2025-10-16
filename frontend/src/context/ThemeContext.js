//frontend/src/context/ThemeContext.js
import React, { createContext, useState, useMemo } from 'react';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(prev => !prev);

  const theme = useMemo(
    () => (isDark ? MD3DarkTheme : MD3LightTheme),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
