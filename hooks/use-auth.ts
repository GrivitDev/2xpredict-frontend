'use client';
/* React Query hooks for every auth controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { authService } from '../services/auth.service';
import type { ChangePasswordArgs, LoginArgs, RegisterArgs, RequestEmailChangeArgs, RequestPasswordResetArgs, ResetPasswordArgs, VerifyCurrentEmailForChangeArgs, VerifyNewEmailForChangeArgs } from '../types/endpoint-args/auth';

export function useRegisterMutation<TData = any>(options?: ApiMutationHookOptions<TData, RegisterArgs>) {
  return useMutation<TData, Error, RegisterArgs>({
    mutationFn: (args: RegisterArgs) => authService.register<TData>(args),
    ...options,
  });
}

export function useLoginMutation<TData = any>(options?: ApiMutationHookOptions<TData, LoginArgs>) {
  return useMutation<TData, Error, LoginArgs>({
    mutationFn: (args: LoginArgs) => authService.login<TData>(args),
    ...options,
  });
}

export function useGetCurrentUserQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['auth', 'getCurrentUser'],
    queryFn: () => authService.getCurrentUser<TData>(),
    ...options,
  });
}

export function useRequestPasswordResetMutation<TData = any>(options?: ApiMutationHookOptions<TData, RequestPasswordResetArgs>) {
  return useMutation<TData, Error, RequestPasswordResetArgs>({
    mutationFn: (args: RequestPasswordResetArgs) => authService.requestPasswordReset<TData>(args),
    ...options,
  });
}

export function useResetPasswordMutation<TData = any>(options?: ApiMutationHookOptions<TData, ResetPasswordArgs>) {
  return useMutation<TData, Error, ResetPasswordArgs>({
    mutationFn: (args: ResetPasswordArgs) => authService.resetPassword<TData>(args),
    ...options,
  });
}

export function useRequestEmailChangeMutation<TData = any>(options?: ApiMutationHookOptions<TData, RequestEmailChangeArgs>) {
  return useMutation<TData, Error, RequestEmailChangeArgs>({
    mutationFn: (args: RequestEmailChangeArgs) => authService.requestEmailChange<TData>(args),
    ...options,
  });
}

export function useVerifyCurrentEmailForChangeMutation<TData = any>(options?: ApiMutationHookOptions<TData, VerifyCurrentEmailForChangeArgs>) {
  return useMutation<TData, Error, VerifyCurrentEmailForChangeArgs>({
    mutationFn: (args: VerifyCurrentEmailForChangeArgs) => authService.verifyCurrentEmailForChange<TData>(args),
    ...options,
  });
}

export function useVerifyNewEmailForChangeMutation<TData = any>(options?: ApiMutationHookOptions<TData, VerifyNewEmailForChangeArgs>) {
  return useMutation<TData, Error, VerifyNewEmailForChangeArgs>({
    mutationFn: (args: VerifyNewEmailForChangeArgs) => authService.verifyNewEmailForChange<TData>(args),
    ...options,
  });
}

export function useChangePasswordMutation<TData = any>(options?: ApiMutationHookOptions<TData, ChangePasswordArgs>) {
  return useMutation<TData, Error, ChangePasswordArgs>({
    mutationFn: (args: ChangePasswordArgs) => authService.changePassword<TData>(args),
    ...options,
  });
}
