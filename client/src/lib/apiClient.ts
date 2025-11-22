import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('vibenote-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from server:', error.request);
        } else {
            // Something else happened
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
