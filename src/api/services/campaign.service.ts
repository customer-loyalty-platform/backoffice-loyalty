import apiClient from '../client';
import type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  UpdateCampaignStatusRequest,
  CampaignSearchParams,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const campaignService = {
  async getCampaigns(params?: CampaignSearchParams): Promise<PaginatedResponse<Campaign>> {
    const { data } = await apiClient.get<PaginatedResponse<Campaign>>('/campaigns', { params });
    return data;
  },

  async createCampaign(payload: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {
    const { data } = await apiClient.post<ApiResponse<Campaign>>('/campaigns', payload);
    return data;
  },

  async updateCampaign(id: string, payload: UpdateCampaignRequest): Promise<ApiResponse<Campaign>> {
    const { data } = await apiClient.put<ApiResponse<Campaign>>(`/campaigns/${id}`, payload);
    return data;
  },

  async updateCampaignStatus(id: string, payload: UpdateCampaignStatusRequest): Promise<ApiResponse<Campaign>> {
    const { data } = await apiClient.patch<ApiResponse<Campaign>>(`/campaigns/${id}/status`, payload);
    return data;
  },
};

