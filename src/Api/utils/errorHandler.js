// src/api/utils/errorHandler.js
export const handleError = (error) => {
    console.error('API Error:', error);
    throw error;
  };