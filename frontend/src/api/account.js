//frontend/src/api/account.js
import { API_AUTH } from './apiConfig';
import { BASE_URL } from './baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

API_AUTH.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProfile = () => API_AUTH.get('/me');
export const updateProfile = data => API_AUTH.put('/profile', data);
export const changePassword = data => API_AUTH.put('/change-password', data);

export const uploadAvatar = async formData => {
  const token = await AsyncStorage.getItem('token');
  return axios.post(`${BASE_URL}/auth/upload-avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
};
