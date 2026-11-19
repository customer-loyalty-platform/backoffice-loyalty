import apiClient from '../client';
export const partnerService = {
    async getPartners() {
        const { data } = await apiClient.get('/partners');
        return data;
    },
    async createPartner(payload) {
        const { data } = await apiClient.post('/partners', payload);
        return data;
    },
    async updatePartner(id, payload) {
        const { data } = await apiClient.put(`/partners/${id}`, payload);
        return data;
    },
    async getSettlementReport(params) {
        const { data } = await apiClient.get('/partners/settlement-report', { params });
        return data;
    },
};
