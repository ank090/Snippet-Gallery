// src/api.js
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const customFetch = async (endpoint, options = {}, onUnauthorized) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Automatically handle expired tokens or unauthenticated access
    if (response.status === 401) {
      localStorage.removeItem('token');
      if (onUnauthorized) {
        onUnauthorized();
      }
      throw new Error("Session expired. Please log in again.");
    }

    return response;
  } catch (error) {
    throw error;
  }
};