// /types/user.ts

// ============================================================
// USER ENUMS
// ============================================================

export type UserRole =
  | 'user'
  | 'admin';

export type UserStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'deleted';

export type UserCurrency =
  | 'NGN'
  | 'USD';


// ============================================================
// USER
// ============================================================

export interface User {

  // =========================
  // IDENTITY
  // =========================

  _id: string;

  fullName: string;

  username: string;

  email: string;

  phoneNumber?: string;


  // =========================
  // LOCATION
  // =========================

  country?: string;

  countryCode?: string;

  currency: UserCurrency;


  // =========================
  // ACCOUNT
  // =========================

  role: UserRole;

  status: UserStatus;

  isVerified: boolean;


  // =========================
  // LOGIN TRACKING
  // =========================

  createdAt: string;

  updatedAt?: string;

  lastLoginAt?: string;

  loginCount?: number;


  // =========================
  // BAN / SUSPENSION
  // =========================

  bannedUntil?: string;

  banReason?: string;

  bannedBy?: string;


  // =========================
  // SOFT DELETE
  // =========================

  isDeleted?: boolean;

  deletedAt?: string;

  deletedBy?: string;


  // =========================
  // REFERRAL
  // =========================

  referredBy?: string;

  pendingPromoCode?: string;

  successfulReferrals?: number;


  // =========================
  // VERIFICATION
  // =========================

  verificationExpiresAt?: string;

}