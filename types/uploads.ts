export interface UploadAsset {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  originalName?: string;
  [key: string]: unknown;
}
export interface UploadResponse { data?: UploadAsset; message?: string; [key: string]: unknown }
