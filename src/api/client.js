import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constants';
/**
 * Axios instance configured for BackOffice API
 * - Auto-attaches JWT Authorization header
 * - Handles token refresh on 401
 * - Standardized error handling
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
/** Request interceptor — attach JWT token */
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
/** Response interceptor — handle 401 refresh & error formatting */
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    // Attempt token refresh on 401 (not on login endpoint)
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login')) {
        originalRequest._retry = true;
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (!refreshToken)
                throw new Error('No refresh token');
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
            });
            const newToken = data.data.access_token;
            localStorage.setItem(TOKEN_KEY, newToken);
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
        }
        catch {
            // Refresh failed — force logout
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            window.location.href = '/login';
            return Promise.reject(error);
        }
    }
    return Promise.reject(error);
});
export default apiClient;
