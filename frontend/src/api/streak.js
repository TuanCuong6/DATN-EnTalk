// frontend/src/api/streak.js
import { API_STREAK } from './apiConfig';

export const getStreak = async () => {
  const response = await API_STREAK.get('/');
  return response.data;
};
