import apiClient from '../client';
import type {
  PendingAction,
  ApproveActionResponse,
  RejectActionRequest,
  AuditLogEntry,
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  AuditLogSearchParams,
  PendingActionSearchParams,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const auditService = {
  async getPendingActions(params?: PendingActionSearchParams): Promise<PaginatedResponse<PendingAction>> {
    const { data } = await apiClient.get<PaginatedResponse<PendingAction>>('/pending-actions', { params });
    return data;
  },

  async approveAction(id: string): Promise<ApproveActionResponse> {
    const { data } = await apiClient.post<ApproveActionResponse>(`/pending-actions/${id}/approve`);
    return data;
  },

  async rejectAction(id: string, payload: RejectActionRequest): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.post(`/pending-actions/${id}/reject`, payload);
    return data;
  },

  async getAuditLogs(params?: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogEntry>> {
    const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', { params });
    return data;
  },

  async getAdminUsers(): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await apiClient.get<PaginatedResponse<AdminUser>>('/users');
    return data;
  },

  async createAdminUser(payload: CreateAdminUserRequest): Promise<ApiResponse<AdminUser>> {
    const { data } = await apiClient.post<ApiResponse<AdminUser>>('/users', payload);
    return data;
  },

  async updateAdminUser(id: string, payload: UpdateAdminUserRequest): Promise<ApiResponse<AdminUser>> {
    const { data } = await apiClient.put<ApiResponse<AdminUser>>(`/users/${id}`, payload);
    return data;
  },
};

