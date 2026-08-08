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

    if (
      !trimmedMessage ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      await onSubmit(
        trimmedMessage,
      );

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
        gap-2
      "
      aria-busy={loading}
    >
      <Input
        value={message}
        onChange={(event) =>
          setMessage(
            event.target.value,
          )
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
          h-11
          min-w-0
          flex-1
          rounded-xl
          bg-background
          text-sm
          shadow-sm
          placeholder:text-muted-foreground
          focus-visible:ring-2
          focus-visible:ring-primary/30
        "
      />

      <Button
        type="button"
        onClick={() =>
          void submit()
        }
        disabled={isDisabled}
        className="
          h-11
          shrink-0
          gap-2
          rounded-xl
          px-4
          shadow-sm
          transition-all
          active:scale-[0.98]
          disabled:pointer-events-none
          disabled:opacity-60
        "
      >
        {loading ? (
          <>
            <Loader2
              className="
                size-4
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
          <>
            <span>
              Reply
            </span>
          </>
        )}
      </Button>
    </div>
  );
}