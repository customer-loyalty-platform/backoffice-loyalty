import apiClient from '../client';
import type {
  VoucherBatch,
  CreateVoucherBatchRequest,
  UploadCodesResponse,
  VoucherInventoryItem,
  RevokeVouchersRequest,
  VoucherSearchParams,
  VoucherInventorySearchParams,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const voucherService = {
  async getBatches(params?: VoucherSearchParams): Promise<PaginatedResponse<VoucherBatch>> {
    const { data } = await apiClient.get<PaginatedResponse<VoucherBatch>>('/voucher-batches', { params });
    return data;
  },

  async createBatch(payload: CreateVoucherBatchRequest): Promise<ApiResponse<VoucherBatch>> {
    const { data } = await apiClient.post<ApiResponse<VoucherBatch>>('/voucher-batches', payload);
    return data;
  },

  async uploadCodes(batchId: string, file: File): Promise<ApiResponse<UploadCodesResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<UploadCodesResponse>>(
      `/voucher-batches/${batchId}/upload-codes`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  async getBatchInventory(batchId: string, params?: VoucherInventorySearchParams): Promise<PaginatedResponse<VoucherInventoryItem>> {
    const { data } = await apiClient.get<PaginatedResponse<VoucherInventoryItem>>(
      `/voucher-batches/${batchId}/inventory`,
      { params }
    );
    return data;
  },

  async revokeVouchers(batchId: string, payload: RevokeVouchersRequest): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.post(`/voucher-batches/${batchId}/revoke`, payload);
    return data;
  },
};

