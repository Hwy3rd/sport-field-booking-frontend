import api from "@/lib/api/axios";
import { ApiListResponse, ApiResponse } from "@/types/api.type";
import {
  AdminChangePasswordRequest,
  AdminUpdateUserResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CreateUserRequest,
  GetAllUsersRequest,
  UpdateUserAdminRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  User,
} from "@/types/user.type";

export const UserService = {
  //Role user endpoints
  fetchMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>("/user/me");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch user");
    }

    return data.data;
  },

  updateUser: async (updateData: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const { data } = await api.put<ApiResponse<UpdateUserResponse>>("/user/me", updateData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update user");
    }

    return data.data;
  },

  changePassword: async (userData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const { data } = await api.post<ApiResponse<ChangePasswordResponse>>(
      "/user/me/change-password",
      userData,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to change password");
    }

    return data.data;
  },

  //Role admin endpoints
  getUserById: async (userId: string): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch user");
    }

    return data.data;
  },

  getAllUsers: async (filter: GetAllUsersRequest): Promise<ApiListResponse<User>> => {
    const { data } = await api.get<ApiResponse<ApiListResponse<User>>>("/admin/users", {
      params: filter,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return data.data;
  },

  adminUpdateUser: async (userData: UpdateUserAdminRequest): Promise<AdminUpdateUserResponse> => {
    const { data } = await api.put<ApiResponse<AdminUpdateUserResponse>>(
      `/admin/users/${userData.id}`,
      userData,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update user");
    }

    return data.data;
  },

  adminCreateUser: async (userData: CreateUserRequest): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>("/admin/users", userData);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create user");
    }

    return data.data;
  },

  adminChangePassword: async (
    userId: string,
    userData: AdminChangePasswordRequest,
  ): Promise<ChangePasswordResponse> => {
    const { data } = await api.post<ApiResponse<ChangePasswordResponse>>(
      `/admin/users/${userId}/change-password`,
      userData,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to change password");
    }

    return data.data;
  },

  deleteUser: async (userId: string): Promise<any> => {
    const { data } = await api.delete<ApiResponse<null>>(`/admin/users/${userId}`);
    if (!data.success) {
      throw new Error(data.message || "Failed to delete user");
    }

    return data.data;
  },

  deleteMultipleUsers: async (userIds: string[]): Promise<any> => {
    const { data } = await api.delete<ApiResponse<null>>(`/admin/users`, {
      data: { userIds },
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to delete users");
    }

    return data.data;
  },
};
