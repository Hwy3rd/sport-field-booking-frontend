"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/helper/get-message";
import { UserService } from "@/services/user.service";
import type {
  AdminChangePasswordRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  GetAllUsersRequest,
  UpdateUserAdminRequest,
  UpdateUserRequest,
} from "@/types/user.type";
import { useAuthStore } from "@/stores/auth.store";

export const userKeys = {
  me: ["users", "me"] as const,
  all: ["users"] as const,
  list: (filter?: GetAllUsersRequest) => ["users", "list", filter ?? {}] as const,
  detail: (userId: string) => ["users", "detail", userId] as const,
};

export const useMe = () =>
  useQuery({
    queryKey: userKeys.me,
    queryFn: UserService.fetchMe,
    staleTime: 60_000,
  });

export const useUsersList = (filter: GetAllUsersRequest = {}) =>
  useQuery({
    queryKey: userKeys.list(filter),
    queryFn: () => UserService.getAllUsers(filter),
    staleTime: 60_000,
  });

export const useUserDetail = (userId: string, enabled = true) =>
  useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => UserService.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: UpdateUserRequest) => UserService.updateUser(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.me, data);
      setUser(data);

      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    },
  });
};

export const useChangeMyPassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => UserService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to change password"));
    },
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: UpdateUserAdminRequest) => UserService.adminUpdateUser(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });

      if (user?.id === data.id) {
        setUser(data);
        queryClient.setQueryData(userKeys.me, data);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update user"));
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => UserService.adminCreateUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create user"));
    },
  });
};

export const useAdminChangePassword = () => {
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminChangePasswordRequest }) =>
      UserService.adminChangePassword(userId, payload),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to change password"));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    },
  });
};

export const useDeleteMultipleUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => UserService.deleteMultipleUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Users deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete users"));
    },
  });
};
