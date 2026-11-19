import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardService } from '@/api/services/dashboard.service';
import type { DashboardSummary, ChartDataPoint, PointLedgerEntry } from '@/api/contracts';

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null);
  const transactionFeed = ref<PointLedgerEntry[]>([]);
  const earningTrend = ref<ChartDataPoint[]>([]);
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
    } finally {
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

