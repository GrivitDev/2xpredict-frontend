// types/admin-user.types.ts

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  username?: string;

  role: 'user' | 'admin';
  status: UserStatus;

  isVerified: boolean;

  lastLoginAt?: string;
  createdAt: string;

  loginCount?: number;
  totalPredictions?: number;
  totalPayments?: number;
  totalSpent?: number;
}

export interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'suspended' | 'deleted';
  role: 'all' | 'user' | 'admin';
}