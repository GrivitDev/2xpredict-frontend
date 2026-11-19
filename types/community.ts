import type { IdRecord } from '@/types/common';

export type CommunityPostType = 'discussion' | 'media';
export type CommunityMediaType = 'image' | 'video';
export interface CommunityMedia {
  type: CommunityMediaType; url: string; publicId: string;
  width?: number; height?: number; format?: string; bytes?: number;
}
export interface CreateCommunityPostPayload {
  type: CommunityPostType; title?: string; message?: string; category?: string; media?: CommunityMedia;
}
export type UpdateCommunityPostPayload = Partial<CreateCommunityPostPayload>;
export interface CommunityPost extends IdRecord {
  type: CommunityPostType; title?: string; message?: string; username: string; fullName: string;
  category?: string; media?: CommunityMedia; replyCount: number; reactions?: Record<string, number>;
  isFeatured: boolean; isPinned: boolean; isLocked: boolean;
}
export interface CommunityReply extends IdRecord {
  postId: string; username: string; fullName: string; message: string;
}
export interface CommunityPostDetails extends CommunityPost { replies: CommunityReply[] }
export interface CommunityPostsResult { posts: CommunityPost[]; page: number; total: number; totalPages: number }
