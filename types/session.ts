// /types/session.ts

export interface SessionLocation {

  country?: string;

  countryCode?: string;

  region?: string;

  city?: string;

  timezone?: string;

  isp?: string;

  organization?: string;

  latitude?: number;

  longitude?: number;

}


export interface UserSession {

  _id: string;

  userId: string;

  ipAddress: string;

  userAgent: string;

  device: string;

  location?: SessionLocation;

  isActive: boolean;

  expired?: boolean;

  lastActiveAt: string;

  expiresAt: string;

  createdAt: string;

  updatedAt: string;

}