import { UserRole } from "@/lib/constants/user.constant";
import { UUID } from "./common.type";
import { User } from "./user.type";

export interface LoginRequest {
  identifier: string; // can be username or email
  password: string;
}

export interface LoginResponse {
  accessToken: string;

  id: UUID;
  role: UserRole;
  fullName: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResponse extends User {}

export interface RefreshTokenResponse extends LoginResponse {}
