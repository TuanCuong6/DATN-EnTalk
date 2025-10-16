//frontend/src/api/feedback.js
import { BASE_URL } from './baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const sendFeedback = async formData => {
  const token = await AsyncStorage.getItem('token');
  return axios.post(`${BASE_URL}/feedback/send`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
};
