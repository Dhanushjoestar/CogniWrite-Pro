// src/services/authService.js
import api from './api'; // Ensure your axios instance is imported

export const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data; // Expecting "User registered success!" or similar
  } catch (error) {
    console.error('Registration API error:', error.response ? error.response.data : error.message);
    throw error; // Re-throw to be caught by AuthContext
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    // Expecting { accessToken: "...", tokenType: "Bearer " }
    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response ? error.response.data : error.message);
    throw error; // Re-throw to be caught by AuthContext
  }
};

// You might add a function here later to set the JWT for all subsequent API calls
// For now, the 'api.js' setup doesn't automatically send the token.
// If you want to send token with all requests, you'd modify api.js to include an interceptor.
// Example for api.js interceptor (not part of this step, just for future reference):
/*
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // Or get from AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});
*/
