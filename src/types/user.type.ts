import { UserRole, UserStatus } from "../lib/constants/user.constant";
import { FilterQuery } from "./api.type";
import { RegisterRequest } from "./auth.type";
import { ISODateTimeString, UUID } from "./common.type";

export interface User {
  id: UUID;

  username: string;
  email: string;
  fullName: string;

  phone?: string;

  role: UserRole;
  status: UserStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface SimpleUserInfo {
  id: UUID;
  role: UserRole;
  fullName: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

export interface UpdateUserResponse extends User {}

export interface UpdateUserAdminRequest extends UpdateUserRequest {
  id: UUID;
  role?: UserRole;
  status?: UserStatus;
}

export interface AdminUpdateUserResponse extends User {}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse extends User {}

export interface GetAllUsersRequest extends FilterQuery {
  email?: string;
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateUserRequest extends RegisterRequest {
  role?: UserRole;
  status?: UserStatus;
}

export interface AdminChangePasswordRequest {
  newPassword: string;
}
