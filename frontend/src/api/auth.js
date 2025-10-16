//frontend/src/api/auth.js
import { API_AUTH } from './apiConfig';

export const register = data => API_AUTH.post('/register', data);
export const verifyEmail = data => API_AUTH.post('/verify', data);
export const login = data => API_AUTH.post('/login', data);
export const forgotPassword = data => API_AUTH.post('/forgot-password', data);
