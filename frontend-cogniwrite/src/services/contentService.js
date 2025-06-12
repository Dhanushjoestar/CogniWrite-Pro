// src/services/contentService.js
import api from './api';

export const generateContent = async (payload) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.post('/content/generate', payload);
    return response.data;
  } catch (error) {
    console.error('Error generating content:', error.response ? error.response.data : error.message);
    throw error; // Re-throw to be handled by the component
  }
};

export const getContentById = async (id) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.get(`/content/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching content with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getContentByUserId = async (userId) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.get(`/content/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching content for user ID ${userId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteContent = async (id) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.delete(`/content/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting content with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};