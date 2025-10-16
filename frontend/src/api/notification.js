// frontend/src/api/notification.js
import { BASE_URL } from './baseURL';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveFcmToken = async fcmToken => {
  const token = await AsyncStorage.getItem('token');
  return axios.post(
    `${BASE_URL}/notification/save-token`,
    { fcm_token: fcmToken },
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

export const getNotificationList = async () => {
  const token = await AsyncStorage.getItem('token');
  return axios.get(`${BASE_URL}/notification/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markNotificationAsRead = async id => {
  const token = await AsyncStorage.getItem('token');
  return axios.post(
    `${BASE_URL}/notification/mark-read`,
    { id },
    { headers: { Authorization: `Bearer ${token}` } },
  );
};
