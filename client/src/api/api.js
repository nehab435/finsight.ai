import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (formData) => API.post('/auth/register', formData);
export const loginUser = (formData) => API.post('/auth/login', formData);
export const getUserProfile = () => API.get('/auth/me');
export const updatePassword = (data) => API.put('/auth/update-password', data);

export const uploadDocument = (formData) => API.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getDocuments = () => API.get('/documents');
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const updateDocument = (id, data) => API.put(`/documents/${id}`, data);

export const getFinancialHealth = () => API.get('/insights/health-score');
export const getAccounts = () => API.get('/accounts');
export const addAccount = (data) => API.post('/accounts', data);
export const deleteAccount = (id) => API.delete(`/accounts/${id}`);

export const sendChatMessage = (message) => API.post('/chat', { message });
export const getChatHistory = () => API.get('/chat');

export default API;