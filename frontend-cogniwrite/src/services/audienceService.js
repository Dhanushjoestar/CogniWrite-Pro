// src/services/audienceService.js
import api from './api';

export const createAudienceProfile = async (data) => {
  try {
    const response = await api.post('/audience', data);
    return response.data;
  } catch (error) {
    console.error('Error creating audience profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAllAudienceProfiles = async () => {
  console.log('Attempting to fetch all audience profiles...');
  try {
    const response = await api.get('/audience');
    console.log('Successfully fetched audience profiles:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all audience profiles:', error.response ? error.response.data : error.message);
    // If it's an Axios error, log more details
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

export const getAudienceProfileById = async (id) => {
  try {
    const response = await api.get(`/audience/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching audience profile with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateAudienceProfile = async (id, data) => {
  try {
    const response = await api.put(`/audience/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating audience profile with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteAudienceProfile = async (id) => {
  try {
    const response = await api.delete(`/audience/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting audience profile with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};
