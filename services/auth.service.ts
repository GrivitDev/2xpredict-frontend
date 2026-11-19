/* Generated from backend controller: auth/auth.controller.ts. */
import { apiRequest } from '../lib/axios';
import type { ChangePasswordArgs, LoginArgs, RegisterArgs, RequestEmailChangeArgs, RequestPasswordResetArgs, ResetPasswordArgs, VerifyCurrentEmailForChangeArgs, VerifyNewEmailForChangeArgs } from '../types/endpoint-args/auth';

export const authService = {
  register: <TResponse = any>(args: RegisterArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/register',
      body: args.body,
    });
  },
  login: <TResponse = any>(args: LoginArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/login',
      body: args.body,
    });
  },
  getCurrentUser: <TResponse = any>() => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/auth/me',
    });
  },
  requestPasswordReset: <TResponse = any>(args: RequestPasswordResetArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/request-password-reset',
      body: { email: args.body.email },
    });
  },
  resetPassword: <TResponse = any>(args: ResetPasswordArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/reset-password',
      body: args.body,
    });
  },
  requestEmailChange: <TResponse = any>(args: RequestEmailChangeArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/email-change/request',
      body: args.body,
    });
  },
  verifyCurrentEmailForChange: <TResponse = any>(args: VerifyCurrentEmailForChangeArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/email-change/verify-current',
      body: args.body,
    });
  },
  verifyNewEmailForChange: <TResponse = any>(args: VerifyNewEmailForChangeArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/email-change/verify-new',
      body: args.body,
    });
  },
  changePassword: <TResponse = any>(args: ChangePasswordArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/auth/change-password',
      body: args.body,
    });
  },
} as const;

import Cookies from 'js-cookie';
import { otpService } from './otp.service';
export async function registerUser(payload: Record<string, unknown>) { return authService.register<any>({ body: payload as never }); }
export async function loginUser(payload: { email: string; password: string }) { return authService.login<any>({ body: payload as never }); }
export async function verifyOtp(payload: Record<string, unknown> | string, code?: string) {
  const body = typeof payload === 'string' ? { email: payload, code: code ?? '' } : payload;
  return otpService.verifyOtp<any>({ body: { email: String((body as any).email ?? ''), code: String((body as any).code ?? (body as any).otp ?? '') } });
}
export async function resendOtp(payload: Record<string, unknown> | string) {
  const body = typeof payload === 'string' ? { email: payload } : payload;
  return otpService.resendOtp<any>({ body: { email: String((body as any).email ?? '') } });
}
export async function changePassword(payload: Record<string, unknown>) { return authService.changePassword<any>({ body: payload as never }); }
export function logoutUser() {
  if (typeof window === 'undefined') return;
  Cookies.remove('token');
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
}

