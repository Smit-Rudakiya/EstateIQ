import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach token from localStorage on init
const token = localStorage.getItem('estateiq_token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('estateiq_token');
            delete api.defaults.headers.common['Authorization'];
            const path = window.location.pathname;
            if (path !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
