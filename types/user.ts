// /types/user.ts
export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;

  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';

  isVerified: boolean;

  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
}