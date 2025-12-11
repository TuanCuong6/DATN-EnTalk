// frontend/src/api/youtubeReading.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseURL';

// Analyze YouTube video
export const analyzeYoutubeVideo = async (videoUrl) => {
  const token = await AsyncStorage.getItem('token');
  const url = `${BASE_URL}/youtube-reading/analyze`;
  
  console.log(' [Frontend] Calling analyze API');
  console.log(' URL:', url);
  console.log(' Video URL:', videoUrl);
  console.log(' Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  
  const response = await axios.post(
    url,
    { videoUrl },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log(' [Frontend] Response:', response.data);
  return response.data;
};

// Generate reading from YouTube
export const generateYoutubeReading = async (videoUrl) => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/youtube-reading/generate`,
    { videoUrl },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
