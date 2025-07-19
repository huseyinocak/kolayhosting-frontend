// src/api/providers.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const providersApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Axios interceptor: Her istekten önce Authorization başlığını ekler
providersApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token'); // Get token from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Gets all hosting providers.
 * @returns {Promise<object[]>} List of providers
 */
export const getAllProviders = async () => {
    try {
        const response = await providersApi.get('/providers');
        return response.data.data; // Adjusted according to API response structure
    } catch (error) {
        console.error('Error fetching all providers:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gets details for a specific provider.
 * @param {string|number} providerId - Provider ID
 * @returns {Promise<object>} Provider details
 */
export const getProviderById = async (providerId) => {
    try {
        const response = await providersApi.get(`/providers/${providerId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching provider details for ID ${providerId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lists plans for a specific provider.
 * @param {string|number} providerId - Provider ID
 * @returns {Promise<object[]>} List of plans for the provider
 */
export const getProviderPlans = async (providerId) => {
    try {
        const response = await providersApi.get(`/providers/${providerId}/plans`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching plans for provider ID ${providerId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lists reviews for a specific provider.
 * @param {string|number} providerId - Provider ID
 * @returns {Promise<object[]>} List of reviews for the provider
 */
export const getProviderReviews = async (providerId) => {
    try {
        const response = await providersApi.get(`/providers/${providerId}/reviews`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching reviews for provider ID ${providerId}:`, error.response?.data || error.message);
        throw error;
    }
};

// For Admin operations (to be used later)
/**
 * Creates a new provider (Admin authorization required).
 * @param {object} providerData - New provider information (name, logo_url, website_url, description, average_rating)
 * @returns {Promise<object>} Created provider
 */
export const createProvider = async (providerData) => {
    try {
        const response = await providersApi.post('/providers', providerData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating provider:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Updates a provider (Admin authorization required).
 * @param {string|number} providerId - ID of the provider to update
 * @param {object} updatedData - Updated provider information
 * @returns {Promise<object>} Updated provider
 */
export const updateProvider = async (providerId, updatedData) => {
    try {
        const response = await providersApi.put(`/providers/${providerId}`, updatedData);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating provider ID ${providerId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Deletes a provider (Admin authorization required).
 * @param {string|number} providerId - ID of the provider to delete
 * @returns {Promise<void>}
 */
export const deleteProvider = async (providerId) => {
    try {
        await providersApi.delete(`/providers/${providerId}`);
    } catch (error) {
        console.error(`Error deleting provider ID ${providerId}:`, error.response?.data || error.message);
        throw error;
    }
};
