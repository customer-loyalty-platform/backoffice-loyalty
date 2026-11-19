import apiClient from '../client';
export const tierService = {
    async getTiers() {
        const { data } = await apiClient.get('/tiers');
        return data;
    },
    async createTier(payload) {
        const { data } = await apiClient.post('/tiers', payload);
        return data;
    },
    async updateTier(id, payload) {
        const { data } = await apiClient.put(`/tiers/${id}`, payload);
        return data;
    },
    async deleteTier(id) {
        const { data } = await apiClient.delete(`/tiers/${id}`);
        return data;
    },
};
