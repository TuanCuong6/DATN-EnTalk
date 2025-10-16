// src/api/chat.js
import { BASE_URL } from './baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_CHAT = axios.create({ baseURL: `${BASE_URL}/chat` });

API_CHAT.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const askChatbot = data => API_CHAT.post('/ask', data);
export const fetchChatHistory = () => API_CHAT.get('/history');
