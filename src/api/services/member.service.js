import apiClient from '../client';
export const memberService = {
    async getMembers(params) {
        const { data } = await apiClient.get('/members', { params });
        return data;
    },
    async getMemberById(id) {
        const { data } = await apiClient.get(`/members/${id}`);
        return data;
    },
    async updateMemberStatus(id, payload) {
        const { data } = await apiClient.patch(`/members/${id}/status`, payload);
        return data;
    },
    async submitPointAdjustment(id, payload) {
        const { data } = await apiClient.post(`/members/${id}/adjustments`, payload);
        return data;
    },
    async getMemberTransactions(id, params) {
        const { data } = await apiClient.get(`/members/${id}/transactions`, { params });
        return data;
    },
};
