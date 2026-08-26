'use client';

import {
  useEffect,
  useState,
} from 'react';

import ReplyCard from './ReplyCard';
import ReplyForm from './ReplyForm';
import ReplySkeleton from './ReplySkeleton';

import type {
  CommunityReply,
} from '@/services/community.service';

interface Props {
  replyCount: number;
  replies: CommunityReply[];
  loading: boolean;
  loadReplies: () => Promise<void>;
  createReply: (
    message: string,
  ) => Promise<void>;
}

export default function ReplySection({
  replyCount,
  replies,
  loading,
  loadReplies,
  createReply,
}: Props) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  useEffect(() => {
    if (
      replyCount > 0 &&
      replies.length === 0
    ) {
      void loadReplies();
    }
  }, [
    replyCount,
    replies.length,
    loadReplies,
  ]);

  async function handleExpand() {
    await loadReplies();
    setExpanded(true);
  }

  const visibleReplies =
    expanded
      ? replies
      : replies.slice(0, 3);

  return (
    <div
      className="
        mt-1.5
        space-y-2
        border-t
        border-border/50
        px-3
        py-2.5
        sm:px-4
      "
    >
      {loading ? (
        <ReplySkeleton />
      ) : replies.length > 0 ? (
        <div className="space-y-1.5">
          {visibleReplies.map(
            (reply) => (
              <ReplyCard
                key={reply._id}
                reply={reply}
              />
            ),
          )}
        </div>
      ) : (
        <div
          className="
            rounded-lg
            border
            border-dashed
            border-border/70
            bg-muted/20
            px-3
            py-3
            text-center
          "
        >
          <p
            className="
              text-xs
              font-medium
              text-foreground
            "
          >
            No replies yet
          </p>

          <p
            className="
              mt-0.5
              text-[11px]
              text-muted-foreground
            "
          >
            Be the first to share your thought...
          </p>
        </div>
      )}

      <ReplyForm
        onSubmit={createReply}
      />

      {replyCount > 3 &&
        !expanded &&
        replies.length > 3 && (
          <button
            type="button"
            onClick={handleExpand}
            className="
              text-xs
              font-semibold
              text-emerald-500
              transition-colors
              hover:text-emerald-400
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-primary/40
            "
          >
            Read more replies →
          </button>
        )}

      {expanded &&
        replies.length > 3 && (
          <button
            type="button"
            onClick={() =>
              setExpanded(false)
            }
            className="
              text-xs
              font-semibold
              text-muted-foreground
              transition-colors
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-primary/40
            "
          >
            Show less ↑
          </button>
        )}
    </div>
  );
}