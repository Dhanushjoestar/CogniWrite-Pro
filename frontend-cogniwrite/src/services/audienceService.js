// src/services/audienceService.js
import api from './api';

export const createAudienceProfile = async (data) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.post('/audience', data);
    return response.data;
  } catch (error) {
    console.error('Error creating audience profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAllAudienceProfiles = async () => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.get('/audience');
    return response.data;
  } catch (error) {
    console.error('Error fetching all audience profiles:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAudienceProfileById = async (id) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.get(`/audience/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching audience profile with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateAudienceProfile = async (id, data) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.put(`/audience/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating audience profile with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteAudienceProfile = async (id) => {
  try {
    // Corrected path: removed redundant /api
    const response = await api.delete(`/audience/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting audience profile with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};