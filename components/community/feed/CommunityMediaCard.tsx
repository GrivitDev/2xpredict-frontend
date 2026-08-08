'use client';

import {
  motion,
} from 'framer-motion';

import type {
  CommunityPost,
  CommunityReply,
} from '@/services/community.service';

import AutoPlayVideo from './AutoPlayVideo';
import ReplySection from '../replies/ReplySection';
import CommunityReactionBar from '../reactions/CommunityReactionBar';

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

export default function CommunityMediaCard({
  post,
  onReact,
  replies,
  repliesLoading,
  loadReplies,
  createReply,
}: Props) {

  const mediaType =
    post.media?.type;

  const hasMedia =
    Boolean(
      post.media?.url,
    );

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
        transition-colors
      "
    >

      {
        hasMedia && (

          <div
            className="
              overflow-hidden
              border-b
              border-border
              bg-muted
            "
          >

            {
              mediaType === 'video'

                ? (

                  <AutoPlayVideo
                    src={
                      post.media!.url
                    }
                    poster={
                      post.media?.url
                    }
                  />

                )

                : (

                  <div
                    className="
                      flex
                      justify-center
                      bg-muted
                    "
                  >

                    <img
                      src={
                        post.media!.url
                      }
                      alt="
                        Community media
                      "
                      loading="lazy"
                      decoding="async"
                      draggable={
                        false
                      }
                      className="
                        block
                        h-auto
                        max-h-[75vh]
                        w-full
                        object-contain
                        bg-muted
                        transition-transform
                        duration-300
                        md:hover:scale-[1.01]
                      "
                    />

                  </div>

                )
            }

          </div>

        )
      }

      <div
        className="
          space-y-4
          p-4
          sm:p-5
        "
      >

        {
          post.message?.trim() && (

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

          )
        }

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <p
            className="
              truncate
              text-xs
              font-medium
              text-muted-foreground
              sm:text-sm
            "
          >
            @{post.username}
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