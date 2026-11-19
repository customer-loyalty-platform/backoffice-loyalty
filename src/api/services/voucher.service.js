import apiClient from '../client';
export const voucherService = {
    async getBatches(params) {
        const { data } = await apiClient.get('/voucher-batches', { params });
        return data;
    },
    async createBatch(payload) {
        const { data } = await apiClient.post('/voucher-batches', payload);
        return data;
    },
    async uploadCodes(batchId, file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await apiClient.post(`/voucher-batches/${batchId}/upload-codes`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return data;
    },
    async getBatchInventory(batchId, params) {
        const { data } = await apiClient.get(`/voucher-batches/${batchId}/inventory`, { params });
        return data;
    },
    async revokeVouchers(batchId, payload) {
        const { data } = await apiClient.post(`/voucher-batches/${batchId}/revoke`, payload);
        return data;
    },
};
