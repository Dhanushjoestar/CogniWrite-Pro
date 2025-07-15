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
export const generateABTestContent=  async (payload)=>{ 
  try{
    const response = await api.post('content/ab-test',payload);
    return response.data;
  }catch(error){
    console.error('error generating ab-test content :',error.response ? error.response.data:error.message);
    throw error;
  }
};

export const generateMetrics = async(payload) =>{
  try{
    const response = await api.post('content/metrics',payload);
    return response.data;
  }catch(error){
    console.error('error generating metrics:',error.response? error.resonse.data:error.message);
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
// NEW: Function to fetch content history summaries
export const getHistoryItems = async (userId) => {
  try {
    // Assuming a backend endpoint like /api/content/history?userId=1
    // Adjust endpoint if your backend uses a different path or authentication
    const response = await api.get(`/content/history${userId ? `?userId=${userId}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history items:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// NEW: Function to fetch a specific content request with its generated content and metrics
export const getFullContentRequestDetails = async (contentRequestId) => {
  try {
    // Assuming a backend endpoint like /api/content/full/{id}
    const response = await api.get(`/content/full/${contentRequestId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching full content request details for ID ${contentRequestId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteContent = async (id) => {
  try {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting content with ID ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};
