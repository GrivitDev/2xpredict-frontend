export interface User {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  country: string;
  countryCode: string;
  currency: 'NGN' | 'USD';
  username?: string;
  fullName?: string;
  isVerified?: boolean;
  status?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, responseUser?: Partial<AuthUser>) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/** JWT and persisted account representations used by providers and account panels. */
export interface AuthUser {
  _id?: string;
  id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: string;
  username?: string;
  fullName?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  status?: string;
  sessionId?: string;
  country?: string;
  countryCode?: string;
  currency?: 'NGN' | 'USD';
  [key: string]: any;
}

export type JwtUser = AuthUser;
