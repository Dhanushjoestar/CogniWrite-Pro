// src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Update if your backend runs on a different port or domain
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;