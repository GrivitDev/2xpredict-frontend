'use client';

import type {
  CommunityPost,
  CommunityReply,
} from '@/services/community.service';

import CommunityReactionBar from '../reactions/CommunityReactionBar';
import ReplySection from '../replies/ReplySection';

interface Props {
  post: CommunityPost;

  onReact: (
    reaction: string,
  ) => void;

  replies: CommunityReply[];

  repliesLoading: boolean;

  loadReplies: () => Promise<void>;

  createReply: (
    message: string,
  ) => Promise<void>;
}

export default function CommunityDiscussionCard({
  post,
  onReact,
  replies,
  repliesLoading,
  loadReplies,
  createReply,
}: Props) {
  const displayName =
    post.fullName?.trim() ||
    post.username;

  const initial =
    displayName
      ?.charAt(0)
      .toUpperCase() || '?';

  return (
    <article
      className="
        overflow-hidden
        rounded-lg
        border
        border-border
        bg-card
        shadow-sm
        md:transition-shadow
        md:duration-200
        md:hover:border-primary/20
        md:hover:shadow-md
      "
    >
      <div
        className="
          p-3
          sm:p-4
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            gap-2.5
          "
        >
          <div
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-sm
              font-semibold
              text-primary
              ring-1
              ring-primary/10
              sm:size-10
            "
            aria-hidden="true"
          >
            {initial}
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                truncate
                text-sm
                font-semibold
                leading-tight
                text-foreground
              "
            >
              {displayName}
            </p>

            <p
              className="
                truncate
                text-[11px]
                leading-tight
                text-muted-foreground
              "
            >
              @{post.username}
            </p>
          </div>
        </div>

        {/* TITLE */}

        {post.title?.trim() && (
          <h2
            className="
              mt-3
              break-words
              text-lg
              font-semibold
              leading-tight
              tracking-tight
              text-foreground
              sm:text-xl
            "
          >
            {post.title}
          </h2>
        )}

        {/* MESSAGE */}

        <p
          className="
            mt-2
            whitespace-pre-wrap
            break-words
            text-sm
            leading-6
            text-foreground
            sm:text-[15px]
            sm:leading-6
          "
        >
          {post.message}
        </p>
      </div>

      <CommunityReactionBar
        reactions={post.reactions}
        onReact={onReact}
      />

      <ReplySection
        replyCount={post.replyCount}
        replies={replies}
        loading={repliesLoading}
        loadReplies={loadReplies}
        createReply={createReply}
      />
    </article>
  );
}