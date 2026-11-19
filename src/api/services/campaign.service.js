import apiClient from '../client';
export const campaignService = {
    async getCampaigns(params) {
        const { data } = await apiClient.get('/campaigns', { params });
        return data;
    },
    async createCampaign(payload) {
        const { data } = await apiClient.post('/campaigns', payload);
        return data;
    },
    async updateCampaign(id, payload) {
        const { data } = await apiClient.put(`/campaigns/${id}`, payload);
        return data;
    },
    async updateCampaignStatus(id, payload) {
        const { data } = await apiClient.patch(`/campaigns/${id}/status`, payload);
        return data;
    },
};
