'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import PostMessageInput from './PostMessageInput';
import MediaUploader from './MediaUploader';
import PostSubmitButton from './PostSubmitButton';

import {
  CommunityMediaType,
  CommunityPostType,
  type CreatePostPayload,
} from '@/services/community.service';

import { uploadService } from '@/services/uploads.service';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createPost: (
    data: CreatePostPayload,
  ) => Promise<void>;
}

export default function CreateMediaPostModal({
  open,
  onOpenChange,
  createPost,
}: Props) {
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState<File>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!media) {
      toast.error(
        'Please select a photo or video to share.',
      );
      return;
    }

    try {
      setLoading(true);

      const uploaded =
        await uploadService.uploadCommunityMedia(
          media,
        );

      await createPost({
        type: CommunityPostType.MEDIA,
        message: message.trim(),
        media: {
          type: media.type.startsWith('image/')
            ? CommunityMediaType.IMAGE
            : CommunityMediaType.VIDEO,
          url: uploaded.url,
          publicId: uploaded.publicId,
        },
      });

      toast.success(
        'Your match moment was posted successfully.',
      );

      setMessage('');
      setMedia(undefined);
      onOpenChange(false);
    } catch (error) {
      console.error(
        'Failed to create media post:',
        error,
      );

      toast.error(
        'Could not post your match moment. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (loading) return;

    if (!nextOpen) {
      setMessage('');
      setMedia(undefined);
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          border-border
          bg-card
          p-4
          shadow-lg
          sm:max-w-lg
          sm:p-5
        "
      >
        <DialogHeader className="space-y-1">
          <DialogTitle
            className="
              text-lg
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            Share Match Moment
          </DialogTitle>

          <p
            className="
              text-xs
              leading-5
              text-muted-foreground
              sm:text-sm
            "
          >
            Share a photo or video from the game
            with the community.
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <MediaUploader
            onFileSelected={setMedia}
            disabled={loading}
          />

          <PostMessageInput
            value={message}
            onChange={setMessage}
          />

          <PostSubmitButton
            loading={loading}
            onClick={submit}
          >
            {loading ? 'Posting...' : 'Post'}
          </PostSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}