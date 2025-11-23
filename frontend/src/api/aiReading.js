//frontend/src/api/aiReading.js
import axios from 'axios';
import { BASE_URL } from './baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const generateAIReading = async (topic, description = '') => {
  const token = await AsyncStorage.getItem('token');
  return axios.post(
    `${BASE_URL}/ai-reading/generate`,
    { topic, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
