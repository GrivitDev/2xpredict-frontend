'use client';

import {
  motion,
} from 'framer-motion';

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
      .toUpperCase() ??
    '?';

  return (

    <motion.article
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        shadow-sm
        transition-all
        duration-200
        md:hover:border-primary/20
        md:hover:shadow-md
      "
    >

      <div
        className="
          p-4
          sm:p-5
        "
      >

        {/* Header */}

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
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
              sm:h-11
              sm:w-11
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
                text-foreground
              "
            >
              {displayName}
            </p>

            <p
              className="
                truncate
                text-xs
                text-muted-foreground
              "
            >
              @{post.username}
            </p>

          </div>

        </div>

        {/* Title */}

        {
          post.title?.trim() && (

            <h2
              className="
                mt-5
                break-words
                text-xl
                font-semibold
                leading-tight
                tracking-tight
                text-foreground
                sm:text-2xl
              "
            >
              {post.title}
            </h2>

          )
        }

        {/* Message */}

        <div
          className="
            mt-3
          "
        >

          <p
            className="
              whitespace-pre-wrap
              break-words
              text-sm
              leading-7
              text-foreground
              sm:text-base
            "
          >
            {post.message}
          </p>

        </div>

      </div>

<CommunityReactionBar
  reactions={post.reactions}
  onReact={onReact}
/>

      <ReplySection
        replyCount={
          post.replyCount
        }
        replies={
          replies
        }
        loading={
          repliesLoading
        }
        loadReplies={
          loadReplies
        }
        createReply={
          createReply
        }
      />

    </motion.article>

  );

}