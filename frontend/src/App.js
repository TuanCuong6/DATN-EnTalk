// frontend/src/App.js
import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';
import { AuthProvider } from './context/AuthContext';
import { navigationRef } from './utils/RootNavigation';
import { NotificationProvider } from './context/NotificationContext';

import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
LogBox.ignoreAllLogs();
export default function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ theme }) => (
          <PaperProvider theme={theme}>
            <NavigationContainer ref={navigationRef}>
              <AuthProvider>
                <NotificationProvider>
                  <MainNavigator />
                </NotificationProvider>
              </AuthProvider>
            </NavigationContainer>
          </PaperProvider>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
