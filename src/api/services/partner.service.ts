import apiClient from '../client';
import type {
  PartnerMerchant,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  SettlementReport,
  SettlementReportParams,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const partnerService = {
  async getPartners(): Promise<PaginatedResponse<PartnerMerchant>> {
    const { data } = await apiClient.get<PaginatedResponse<PartnerMerchant>>('/partners');
    return data;
  },

  async createPartner(payload: CreatePartnerRequest): Promise<ApiResponse<PartnerMerchant>> {
    const { data } = await apiClient.post<ApiResponse<PartnerMerchant>>('/partners', payload);
    return data;
  },

  async updatePartner(id: string, payload: UpdatePartnerRequest): Promise<ApiResponse<PartnerMerchant>> {
    const { data } = await apiClient.put<ApiResponse<PartnerMerchant>>(`/partners/${id}`, payload);
    return data;
  },

  async getSettlementReport(params: SettlementReportParams): Promise<ApiResponse<SettlementReport>> {
    const { data } = await apiClient.get<ApiResponse<SettlementReport>>('/partners/settlement-report', { params });
    return data;
  },
};

