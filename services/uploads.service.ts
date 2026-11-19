/* Generated from backend controller: uploads/uploads.controller.ts. */
import { apiRequest } from '../lib/axios';
import type { UploadAdImageArgs, UploadArticleImageArgs, UploadAvatarArgs, UploadCommunityMediaArgs, UploadPaymentProofArgs, UploadPredictionImageArgs } from '../types/endpoint-args/uploads';

export const uploadsService = {
  uploadPaymentProof: <TResponse = any>(args: UploadPaymentProofArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/uploads/payment-proof',
      file: args.file,
      fileField: 'image',
    });
  },
  uploadAdImage: <TResponse = any>(args: UploadAdImageArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/uploads/ads',
      file: args.file,
      fileField: 'image',
    });
  },
  uploadArticleImage: <TResponse = any>(args: UploadArticleImageArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/uploads/articles',
      file: args.file,
      fileField: 'image',
    });
  },
  uploadPredictionImage: <TResponse = any>(args: UploadPredictionImageArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/uploads/predictions',
      file: args.file,
      fileField: 'image',
    });
  },
  uploadAvatar: <TResponse = any>(args: UploadAvatarArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/uploads/avatar',
      file: args.file,
      fileField: 'image',
    });
  },
  uploadCommunityMedia: <TResponse = any>(args: UploadCommunityMediaArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/uploads/community',
      file: args.file,
      fileField: 'media',
    });
  },
} as const;


// Legacy named/default adapter for components that have not yet been migrated.
export const uploadService = {
  uploadPaymentProof: (file: File) => uploadsService.uploadPaymentProof({ file }),
  uploadAdImage: (file: File) => uploadsService.uploadAdImage({ file }),
  uploadArticleImage: (file: File) => uploadsService.uploadArticleImage({ file }),
  uploadPredictionImage: (file: File) => uploadsService.uploadPredictionImage({ file }),
  uploadAvatar: (file: File) => uploadsService.uploadAvatar({ file }),
  uploadCommunityMedia: (file: File) => uploadsService.uploadCommunityMedia({ file }),
};
export const uploadPaymentProof = uploadService.uploadPaymentProof;
export const uploadAdImage = uploadService.uploadAdImage;
export const uploadArticleImage = uploadService.uploadArticleImage;
export const uploadPredictionImage = uploadService.uploadPredictionImage;
export const uploadAvatar = uploadService.uploadAvatar;
export default uploadService;

