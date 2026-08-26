'use client';

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
  const media = post.media;
  const mediaUrl = media?.url;
  const isVideo =
    media?.type === 'video';

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
      {/* MEDIA */}

      {mediaUrl && (
        <div
          className="
            overflow-hidden
            border-b
            border-border
            bg-muted
          "
        >
          {isVideo ? (
            <AutoPlayVideo
              src={mediaUrl}
              poster={mediaUrl}
            />
          ) : (
            <div className="flex justify-center bg-muted">
              <img
                src={mediaUrl}
                alt="Community media"
                loading="lazy"
                decoding="async"
                draggable={false}
                className="
                  block
                  h-auto
                  max-h-[65vh]
                  w-full
                  object-contain
                  bg-muted
                  md:transition-transform
                  md:duration-300
                  md:hover:scale-[1.01]
                "
              />
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}

      {(post.message?.trim() ||
        post.username) && (
        <div
          className="
            space-y-2.5
            p-3
            sm:p-4
          "
        >
          {post.message?.trim() && (
            <p
              className="
                whitespace-pre-wrap
                break-words
                text-sm
                leading-6
                text-foreground
                sm:text-[15px]
              "
            >
              {post.message}
            </p>
          )}

          {post.username && (
            <p
              className="
                truncate
                text-[11px]
                font-medium
                leading-tight
                text-muted-foreground
              "
            >
              @{post.username}
            </p>
          )}
        </div>
      )}

      {/* REACTIONS */}

      <CommunityReactionBar
        reactions={post.reactions}
        onReact={onReact}
      />

      {/* REPLIES */}

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