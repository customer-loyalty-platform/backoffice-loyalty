import apiClient from '../client';
import type {
  TierDefinition,
  CreateTierRequest,
  UpdateTierRequest,
  ApiResponse,
} from '../contracts';

export const tierService = {
  async getTiers(): Promise<ApiResponse<TierDefinition[]>> {
    const { data } = await apiClient.get<ApiResponse<TierDefinition[]>>('/tiers');
    return data;
  },

  async createTier(payload: CreateTierRequest): Promise<ApiResponse<TierDefinition>> {
    const { data } = await apiClient.post<ApiResponse<TierDefinition>>('/tiers', payload);
    return data;
  },

  async updateTier(id: string, payload: UpdateTierRequest): Promise<ApiResponse<TierDefinition>> {
    const { data } = await apiClient.put<ApiResponse<TierDefinition>>(`/tiers/${id}`, payload);
    return data;
  },

  async deleteTier(id: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/tiers/${id}`);
    return data;
  },
};

