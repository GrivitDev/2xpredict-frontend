'use client';

import {
  useState,
} from 'react';

import {
  Loader2,
} from 'lucide-react';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/components/ui/button';

import {
  Input,
} from '@/components/ui/input';

interface Props {
  onSubmit: (
    message: string,
  ) => Promise<void>;
}

export default function ReplyForm({
  onSubmit,
}: Props) {
  const [
    message,
    setMessage,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function submit() {
    const trimmedMessage =
      message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    try {
      setLoading(true);

      await onSubmit(trimmedMessage);

      setMessage('');

      toast.success(
        'Reply posted successfully',
      );
    } catch (error) {
      console.error(
        'Failed to post reply:',
        error,
      );

      toast.error(
        'Unable to post reply. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  const isDisabled =
    loading ||
    !message.trim();

  return (
    <div
      className="
        flex
        w-full
        items-center
        gap-1.5
      "
      aria-busy={loading}
    >
      <Input
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey
          ) {
            event.preventDefault();
            void submit();
          }
        }}
        placeholder="Share your football opinion..."
        disabled={loading}
        aria-label="Write a reply"
        className="
          h-9
          min-w-0
          flex-1
          rounded-lg
          border-border/70
          bg-background
          px-3
          text-xs
          shadow-none
          placeholder:text-muted-foreground/70
          focus-visible:ring-1
          focus-visible:ring-primary/30
          sm:h-10
          sm:text-sm
        "
      />

      <Button
        type="button"
        onClick={() => void submit()}
        disabled={isDisabled}
        className="
          h-9
          shrink-0
          rounded-lg
          px-3
          text-xs
          shadow-none
          transition-opacity
          active:scale-[0.98]
          disabled:pointer-events-none
          disabled:opacity-50
          sm:h-10
          sm:px-3.5
          sm:text-sm
        "
      >
        {loading ? (
          <>
            <Loader2
              className="
                size-3.5
                animate-spin
              "
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              Posting...
            </span>

            <span className="sm:hidden">
              Post
            </span>
          </>
        ) : (
          <span>
            Reply
          </span>
        )}
      </Button>
    </div>
  );
}