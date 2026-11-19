'use client';
/* React Query hooks for every otp controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { otpService } from '../services/otp.service';
import type { ResendOtpArgs, VerifyOtpArgs } from '../types/endpoint-args/otp';

export function useVerifyOtpMutation<TData = any>(options?: ApiMutationHookOptions<TData, VerifyOtpArgs>) {
  return useMutation<TData, Error, VerifyOtpArgs>({
    mutationFn: (args: VerifyOtpArgs) => otpService.verifyOtp<TData>(args),
    ...options,
  });
}

export function useResendOtpMutation<TData = any>(options?: ApiMutationHookOptions<TData, ResendOtpArgs>) {
  return useMutation<TData, Error, ResendOtpArgs>({
    mutationFn: (args: ResendOtpArgs) => otpService.resendOtp<TData>(args),
    ...options,
  });
}

