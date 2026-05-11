import { USER_ROLE, type UserRole } from "@/lib/constants/user.constant";

export const canAccessOwnerRoutes = (role?: UserRole | null) =>
  role === USER_ROLE.OWNER || role === USER_ROLE.ADMIN;

export const canAccessAdminRoutes = (role?: UserRole | null) =>
  role === USER_ROLE.ADMIN;

export const canAccessUserRoutes = (role?: UserRole | null) =>
  !!role &&
  ([USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.ADMIN] as UserRole[]).includes(role);
