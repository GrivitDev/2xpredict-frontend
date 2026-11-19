/* Generated from backend controller: users/users.controller.ts. */
import { apiRequest } from '../lib/axios';
import type { UpdateProfileArgs } from '../types/endpoint-args/users';

export const usersService = {
  getProfile: <TResponse = any>() => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/users/me',
    });
  },
  updateProfile: <TResponse = any>(args: UpdateProfileArgs) => {
    return apiRequest<TResponse>({
      method: 'PATCH',
      path: '/users/me',
      body: args.body,
    });
  },
  deleteAccount: <TResponse = any>() => {
    return apiRequest<TResponse>({
      method: 'DELETE',
      path: '/users/me',
    });
  },
} as const;

