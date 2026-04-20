// types/admin/users.ts

export type UserRole =
  | "CUSTOMER"
  | "ADMIN"
  | "RESTAURANT_MANAGER"
  | "DELIVERY_PARTNER"
  | "SUPPORT_AGENT";

export interface GetAdminUsersParams {
  role?: UserRole;
  page?: number;
  limit?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  role: UserRole;
  referralCode: string;
  createdAt: string;
}

export interface GetAdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}


export interface ChangeUserRoleRequest {
  userId: string;
  role: UserRole;
}


export interface ChangeUserRoleResponse {
  success: boolean;
  message?: string;
}


export type CreateUserRole =
  | "CUSTOMER"
  | "RESTAURANT_MANAGER"
  | "DELIVERY_PARTNER"
  | "ADMIN";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: CreateUserRole;
}

export interface CreatedUser {
  id: string;
  name: string;
  email: string;
  role: CreateUserRole;
  createdAt: string;
}

export interface CreateUserResponse {
  message: string;
  user: CreatedUser;
}