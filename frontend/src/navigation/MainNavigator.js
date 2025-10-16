//frontend/src/navigation/MainNavigation.js
import React, { useContext } from 'react';
import AuthStack from './AuthStack';
import AppNavigator from './AppNavigator';
import { AuthContext } from '../context/AuthContext';

export default function MainNavigator() {
  const { isLoggedIn } = useContext(AuthContext);

  if (isLoggedIn === null) return null;

  return isLoggedIn ? <AppNavigator /> : <AuthStack />;
}
