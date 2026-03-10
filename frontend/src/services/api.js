import axios from 'axios';

// Environment variable for base URL or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedInfo = JSON.parse(userInfo);
                if (parsedInfo.token) {
                    config.headers.Authorization = `Bearer ${parsedInfo.token}`;
                }
            } catch (e) {
                console.error('Error parsing user info from session storage');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login
            sessionStorage.removeItem('userInfo');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;
