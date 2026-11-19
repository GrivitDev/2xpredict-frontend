import type { AuthUser } from '@/types/auth';
import type { IdRecord, UsersPage } from '@/types/common';
import type { UserSession } from '@/types/sessions';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type AdminRoleFilter = 'all' | 'user' | 'admin';
export type AdminStatusFilter = 'all' | UserStatus;

export type UserProfile = Omit<AuthUser, '_id'> & IdRecord & {
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  countryCode?: string;
  currency?: 'NGN' | 'USD';
  isVerified: boolean;
  status: UserStatus;
};

export interface UpdateProfilePayload {
  fullName?: string;
  username?: string;
  phoneNumber?: string;
}

export interface AdminUser extends IdRecord {
  fullName: string;
  email: string;
  username?: string;
  role: 'user' | 'admin';
  status: UserStatus;
  isVerified: boolean;
  lastLoginAt?: string;
  loginCount?: number;
  totalPredictions?: number;
  totalPayments?: number;
  totalSpent?: number;
}

export interface AdminUsersQuery {
  search?: string;
  page?: number;
  limit?: number;
  status?: AdminStatusFilter;
  role?: AdminRoleFilter;
}

export interface SuspendUserPayload {
  reason?: string;
  bannedUntil?: string | Date;
}

export interface AdminUserDetail {
  user: AdminUser;
  payments: Record<string, unknown>;
  subscription: Record<string, unknown> | null;
  sessions: Record<string, unknown>;
}

export type AdminUsersPage = UsersPage<AdminUser>;
export type AdminUserSession = UserSession;
