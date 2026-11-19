'use client';
/* React Query hooks for every uploads controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { uploadsService } from '../services/uploads.service';
import type { UploadAdImageArgs, UploadArticleImageArgs, UploadAvatarArgs, UploadCommunityMediaArgs, UploadPaymentProofArgs, UploadPredictionImageArgs } from '../types/endpoint-args/uploads';

export function useUploadPaymentProofMutation<TData = any>(options?: ApiMutationHookOptions<TData, UploadPaymentProofArgs>) {
  return useMutation<TData, Error, UploadPaymentProofArgs>({
    mutationFn: (args: UploadPaymentProofArgs) => uploadsService.uploadPaymentProof<TData>(args),
    ...options,
  });
}

export function useUploadAdImageMutation<TData = any>(options?: ApiMutationHookOptions<TData, UploadAdImageArgs>) {
  return useMutation<TData, Error, UploadAdImageArgs>({
    mutationFn: (args: UploadAdImageArgs) => uploadsService.uploadAdImage<TData>(args),
    ...options,
  });
}

export function useUploadArticleImageMutation<TData = any>(options?: ApiMutationHookOptions<TData, UploadArticleImageArgs>) {
  return useMutation<TData, Error, UploadArticleImageArgs>({
    mutationFn: (args: UploadArticleImageArgs) => uploadsService.uploadArticleImage<TData>(args),
    ...options,
  });
}

export function useUploadPredictionImageMutation<TData = any>(options?: ApiMutationHookOptions<TData, UploadPredictionImageArgs>) {
  return useMutation<TData, Error, UploadPredictionImageArgs>({
    mutationFn: (args: UploadPredictionImageArgs) => uploadsService.uploadPredictionImage<TData>(args),
    ...options,
  });
}

export function useUploadAvatarMutation<TData = any>(options?: ApiMutationHookOptions<TData, UploadAvatarArgs>) {
  return useMutation<TData, Error, UploadAvatarArgs>({
    mutationFn: (args: UploadAvatarArgs) => uploadsService.uploadAvatar<TData>(args),
    ...options,
  });
}

export function useUploadCommunityMediaMutation<TData = any>(options?: ApiMutationHookOptions<TData, UploadCommunityMediaArgs>) {
  return useMutation<TData, Error, UploadCommunityMediaArgs>({
    mutationFn: (args: UploadCommunityMediaArgs) => uploadsService.uploadCommunityMedia<TData>(args),
    ...options,
  });
}

