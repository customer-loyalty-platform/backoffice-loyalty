import apiClient from '../client';
import type {
  DynamicRule,
  CreateRuleRequest,
  UpdateRuleRequest,
  UpdateRuleStatusRequest,
  RuleSearchParams,
  ApiResponse,
  PaginatedResponse,
} from '../contracts';

export const ruleService = {
  async getRules(params?: RuleSearchParams): Promise<PaginatedResponse<DynamicRule>> {
    const { data } = await apiClient.get<PaginatedResponse<DynamicRule>>('/rules', { params });
    return data;
  },

  async createRule(payload: CreateRuleRequest): Promise<ApiResponse<{ rule_id: string; rule_code: string; state: string }>> {
    const { data } = await apiClient.post('/rules', payload);
    return data;
  },

  async updateRule(id: string, payload: UpdateRuleRequest): Promise<ApiResponse<DynamicRule>> {
    const { data } = await apiClient.put(`/rules/${id}`, payload);
    return data;
  },

  async updateRuleStatus(id: string, payload: UpdateRuleStatusRequest): Promise<ApiResponse<DynamicRule>> {
    const { data } = await apiClient.patch(`/rules/${id}/status`, payload);
    return data;
  },

  async deleteRule(id: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.delete(`/rules/${id}`);
    return data;
  },
};

