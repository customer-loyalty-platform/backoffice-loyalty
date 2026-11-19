import apiClient from '../client';
export const dashboardService = {
    async getSummary() {
        const { data } = await apiClient.get('/dashboard/summary');
        return data;
    },
    async getTransactionFeed(page = 1, limit = 20) {
        const { data } = await apiClient.get('/dashboard/transaction-feed', {
            params: { page, limit },
        });
        return data;
    },
    async getEarningTrend() {
        const { data } = await apiClient.get('/dashboard/charts/earning-trend');
        return data;
    },
};
