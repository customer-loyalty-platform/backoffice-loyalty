import apiClient from '../client';
import type {
  MemberListItem,
  MemberDetail,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
  PointAdjustmentRequest,
  PointAdjustmentResponse,
  PointLedgerEntry,
  MemberSearchParams,
  TransactionSearchParams,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const memberService = {
  async getMembers(params?: MemberSearchParams): Promise<PaginatedResponse<MemberListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<MemberListItem>>('/members', { params });
    return data;
  },

  async getMemberById(id: string): Promise<ApiResponse<MemberDetail>> {
    const { data } = await apiClient.get<ApiResponse<MemberDetail>>(`/members/${id}`);
    return data;
  },

  async updateMemberStatus(id: string, payload: UpdateMemberStatusRequest): Promise<ApiResponse<UpdateMemberStatusResponse>> {
    const { data } = await apiClient.patch<ApiResponse<UpdateMemberStatusResponse>>(`/members/${id}/status`, payload);
    return data;
  },

  async submitPointAdjustment(id: string, payload: PointAdjustmentRequest): Promise<PointAdjustmentResponse> {
    const { data } = await apiClient.post<PointAdjustmentResponse>(`/members/${id}/adjustments`, payload);
    return data;
  },

  async getMemberTransactions(id: string, params?: TransactionSearchParams): Promise<PaginatedResponse<PointLedgerEntry>> {
    const { data } = await apiClient.get<PaginatedResponse<PointLedgerEntry>>(`/members/${id}/transactions`, { params });
    return data;
  },
};
