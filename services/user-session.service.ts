import { apiRequest } from '../lib/axios';
import type { ApiMessage } from '../types/common';
import type { UserSession } from '../types/sessions';

/** Single client for the User Session module. */
const getMySessions = () => apiRequest<UserSession[]>({ method: 'GET', path: '/sessions/me' });

export const userSessionService = {
  getMySessions,
  logoutCurrent: () => apiRequest<ApiMessage>({ method: 'PATCH', path: '/sessions/current/logout' }),
  logoutAll: () => apiRequest<ApiMessage>({ method: 'PATCH', path: '/sessions/logout-all' }),
} as const;

