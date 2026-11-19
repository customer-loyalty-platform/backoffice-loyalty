import apiClient from '../client';
export const authService = {
    async login(payload) {
        const { data } = await apiClient.post('/auth/login', payload);
        return data;
    },
    async refreshToken(refreshToken) {
        const { data } = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return data;
    },
    async logout() {
        await apiClient.post('/auth/logout');
    },
    async getMe() {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },
};
