//frontend/src/api/apiConfig.js;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseURL';
export const API_AUTH = axios.create({
  baseURL: `${BASE_URL}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

export const API_READING = axios.create({
  baseURL: `${BASE_URL}/reading`,
});
export const API_TOPIC = axios.create({
  baseURL: `${BASE_URL}/topics`,
});
export const API_HISTORY = axios.create({
  baseURL: `${BASE_URL}/history`,
});
API_HISTORY.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
