/* Generated from backend controller: otp/otp.controller.ts. */
import { apiRequest } from '../lib/axios';
import type { ResendOtpArgs, VerifyOtpArgs } from '../types/endpoint-args/otp';

export const otpService = {
  verifyOtp: <TResponse = any>(args: VerifyOtpArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/otp/verify',
      body: args.body,
    });
  },
  resendOtp: <TResponse = any>(args: ResendOtpArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/otp/resend',
      body: args.body,
    });
  },
} as const;

