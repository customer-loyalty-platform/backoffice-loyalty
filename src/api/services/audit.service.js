import apiClient from '../client';
export const auditService = {
    async getPendingActions(params) {
        const { data } = await apiClient.get('/pending-actions', { params });
        return data;
    },
    async approveAction(id) {
        const { data } = await apiClient.post(`/pending-actions/${id}/approve`);
        return data;
    },
    async rejectAction(id, payload) {
        const { data } = await apiClient.post(`/pending-actions/${id}/reject`, payload);
        return data;
    },
    async getAuditLogs(params) {
        const { data } = await apiClient.get('/audit-logs', { params });
        return data;
    },
    async getAdminUsers() {
        const { data } = await apiClient.get('/users');
        return data;
    },
    async createAdminUser(payload) {
        const { data } = await apiClient.post('/users', payload);
        return data;
    },
    async updateAdminUser(id, payload) {
        const { data } = await apiClient.put(`/users/${id}`, payload);
        return data;
    },
};
