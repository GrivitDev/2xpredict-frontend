'use client';

import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  MessageCircle,
  Play,
  UserRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  CommunityMediaType,
  CommunityPost,
  CommunityPostType,
} from '@/services/community.service';

interface CommunityPreviewCardProps {
  post: CommunityPost;
  isAuthenticated?: boolean;
}

export default function CommunityPreviewCard({
  post,
  isAuthenticated = false,
}: CommunityPreviewCardProps) {
  const router = useRouter();

  const media = post.media;
  const hasMedia =
    post.type === CommunityPostType.MEDIA && !!media?.url;

  const isImage =
    media?.type === CommunityMediaType.IMAGE;

  const isVideo =
    media?.type === CommunityMediaType.VIDEO;

  const handleOpenPost = () => {
    const destination = `/community/${post._id}`;

    router.push(
      isAuthenticated
        ? destination
        : `/login?redirect=${encodeURIComponent(destination)}`,
    );
  };

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.5,
      }}
      onClick={handleOpenPost}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          handleOpenPost();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View community post by @${post.username}`}
      className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/70
        p-6
        shadow-xl
        backdrop-blur
        transition-all
        duration-300
        hover:border-primary/30
        hover:shadow-2xl
      "
    >
      <motion.div
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-40
          w-40
          rounded-full
          bg-primary/20
          blur-3xl
        "
      />

      <div className="relative">
        <div
          className="
            flex
            items-center
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
            "
          >
            <UserRound
              className="
                h-5
                w-5
                text-primary
              "
            />
          </div>

          <p
            className="
              text-s
              font-semibold
              text-foreground
            "
          >
            @{post.username}
          </p>
        </div>

        {hasMedia && (
          <div
            className="
              relative
              mt-6
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-muted
            "
          >
            {isImage && (
              <img
                src={media!.url}
                alt={
                  post.title ??
                  'Community post image'
                }
                className="
                  aspect-video
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />
            )}

            {isVideo && (
              <div
                className="
                  relative
                  aspect-video
                  w-full
                  overflow-hidden
                  bg-muted
                "
              >
                <video
                  src={media!.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-black/20
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-background/90
                      shadow-lg
                    "
                  >
                    <Play
                      className="
                        ml-0.5
                        h-5
                        w-5
                        fill-current
                        text-primary
                      "
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          {post.title && (
            <h3
              className="
                line-clamp-2
                text-lg
                font-bold
                leading-snug
                text-foreground
              "
            >
              {post.title}
            </h3>
          )}

          {post.message && (
            <p
              className={
                post.title
                  ? `
                    mt-3
                    line-clamp-3
                    text-s
                    leading-relaxed
                    text-muted-foreground
                  `
                  : `
                    line-clamp-4
                    text-s
                    leading-relaxed
                    text-muted-foreground
                  `
              }
            >
              {post.message}
            </p>
          )}
        </div>

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-border
            bg-background/40
            px-4
            py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-s
              text-muted-foreground
            "
          >
            <MessageCircle
              className="
                h-4
                w-4
                text-primary
              "
            />

            <span>
              {post.replyCount}{' '}
              {post.replyCount === 1
                ? 'reply'
                : 'replies'}
            </span>
          </div>
        </div>

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            gap-2
            text-xs
            text-muted-foreground
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {isImage ? (
              <ImageIcon
                className="
                  h-3.5
                  w-3.5
                  text-primary
                "
              />
            ) : isVideo ? (
              <Play
                className="
                  h-3.5
                  w-3.5
                  text-primary
                "
              />
            ) : (
              <MessageCircle
                className="
                  h-3.5
                  w-3.5
                  text-primary
                "
              />
            )}

            View full post
          </div>

          <span
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          >
            →
          </span>
        </div>
      </div>
    </motion.article>
  );
}