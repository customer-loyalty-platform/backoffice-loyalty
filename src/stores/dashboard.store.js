import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardService } from '@/api/services/dashboard.service';
export const useDashboardStore = defineStore('dashboard', () => {
    const summary = ref(null);
    const transactionFeed = ref([]);
    const earningTrend = ref([]);
    const isLoading = ref(false);
    async function fetchDashboardData() {
        isLoading.value = true;
        try {
            const [sumRes, txRes, trendRes] = await Promise.all([
                dashboardService.getSummary(),
                dashboardService.getTransactionFeed(1, 10),
                dashboardService.getEarningTrend(),
            ]);
            summary.value = sumRes.data;
            transactionFeed.value = txRes.data;
            earningTrend.value = trendRes.data;
        }
        finally {
            isLoading.value = false;
        }
    }
    return {
        summary,
        transactionFeed,
        earningTrend,
        isLoading,
        fetchDashboardData,
    };
});
