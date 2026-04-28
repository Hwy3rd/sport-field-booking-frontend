import api from "@/lib/api/axios";
import { ApiResponse } from "@/types/api.type";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth.type";

export const AuthService = {
  login: async (loginData: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", loginData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Login failed");
    }

    return data.data;
  },

  register: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await api.post<ApiResponse<RegisterResponse>>("/auth/register", registerData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Registration failed");
    }

    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const { data } = await api.post<ApiResponse<RefreshTokenResponse>>("/auth/refresh-token");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Token refresh failed");
    }

    return data.data;
  },
};
