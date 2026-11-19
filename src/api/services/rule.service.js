import apiClient from '../client';
export const ruleService = {
    async getRules(params) {
        const { data } = await apiClient.get('/rules', { params });
        return data;
    },
    async createRule(payload) {
        const { data } = await apiClient.post('/rules', payload);
        return data;
    },
    async updateRule(id, payload) {
        const { data } = await apiClient.put(`/rules/${id}`, payload);
        return data;
    },
    async updateRuleStatus(id, payload) {
        const { data } = await apiClient.patch(`/rules/${id}/status`, payload);
        return data;
    },
    async deleteRule(id) {
        const { data } = await apiClient.delete(`/rules/${id}`);
        return data;
    },
};
