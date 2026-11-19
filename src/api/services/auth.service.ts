import apiClient from '../client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  MeResponse,
  ApiResponse,
} from '../contracts';

export const authService = {
  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    const { data } = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<ApiResponse<MeResponse>> {
    const { data } = await apiClient.get<ApiResponse<MeResponse>>('/auth/me');
    return data;
  },
};
