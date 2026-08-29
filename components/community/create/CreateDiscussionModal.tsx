'use client';

import {
  useState,
} from 'react';

import {
  toast,
} from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import PostTitleInput from './PostTitleInput';
import PostMessageInput from './PostMessageInput';
import PostSubmitButton from './PostSubmitButton';

import {
  CommunityPostType,
  type CreatePostPayload,
} from '@/services/community.service';
import { useAnalytics } from '@/hooks/use-analytics';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createPost: (
    data: CreatePostPayload,
  ) => Promise<void>;
}

export default function CreateDiscussionModal({
  open,
  onOpenChange,
  createPost,
}: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const analytics = useAnalytics();
  async function submit() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error(
        'Please write something before publishing your discussion.',
      );
      return;
    }

    try {
      setLoading(true);

      await createPost({
        type: CommunityPostType.DISCUSSION,
        title: title.trim(),
        message: trimmedMessage,
      });

      analytics.track({
        eventType: 'community_post_create',
        eventName: 'community_post_create',
        properties: {
          type: 'discussion',
        },
      });

      toast.success(
        'Discussion published successfully.',
      );

      setTitle('');
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error(
        'Failed to create discussion:',
        error,
      );

      toast.error(
        'Could not publish your discussion. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (loading) return;

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
            Start Football Discussion
          </DialogTitle>

          <DialogDescription
            className="
              text-xs
              leading-5
              text-muted-foreground
              sm:text-sm
            "
          >
            Share your thoughts and start a
            conversation with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <PostTitleInput
            value={title}
            onChange={setTitle}
          />

          <PostMessageInput
            value={message}
            onChange={setMessage}
          />

          <PostSubmitButton
            loading={loading}
            onClick={submit}
          >
            Publish Discussion
          </PostSubmitButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}