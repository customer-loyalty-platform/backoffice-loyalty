import apiClient from '../client';
import type {
  DashboardSummary,
  ChartDataPoint,
  PointLedgerEntry,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const dashboardService = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return data;
  },

  async getTransactionFeed(page = 1, limit = 20): Promise<PaginatedResponse<PointLedgerEntry>> {
    const { data } = await apiClient.get<PaginatedResponse<PointLedgerEntry>>('/dashboard/transaction-feed', {
      params: { page, limit },
    });
    return data;
  },

  async getEarningTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    const { data } = await apiClient.get<ApiResponse<ChartDataPoint[]>>('/dashboard/charts/earning-trend');
    return data;
  },
};

