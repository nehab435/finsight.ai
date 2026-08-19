import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to requests if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Export aliases for both registration and login components
export const registerUser = (formData) => API.post('/auth/register', formData);
export const register = registerUser; 

export const loginUser = (formData) => API.post('/auth/login', formData);
export const login = loginUser;

export const uploadDocument = (formData) => API.post('/documents/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const getDocuments = () => API.get('/documents');
export const updateDocument = (id, fileName) => API.put(`/documents/${id}`, { fileName });
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

export const sendChatMessage = (message) => API.post('/chat', { message });