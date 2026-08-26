'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  communityService,
  CommunityPost,
} from '@/services/community.service';

import CommunityPreviewCard from './CommunityPreviewCard';
import CommunityPreviewSkeleton from './CommunityPreviewSkeleton';

export default function CommunityPreviewSection() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { posts } = await communityService.getPosts();

        setPosts(
          [...posts]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3),
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, []);

  const showEmpty =
    !loading &&
    !error &&
    posts.length === 0;

  const showError =
    !loading &&
    error;

  return (
    <section
      className="
        relative
        overflow-hidden
        py-6
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-transparent
          via-primary/5
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/3
          h-96
          w-96
          -translate-x-1/2
          rounded-full
          bg-primary/5
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-6xl
          px-2
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            mx-auto
            max-w-3xl
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              w-fit
              items-center
              text-5xl
              font-bold
              backdrop-blur
            "
          >
            Football Community
          </div>

          <p
            className="
              mx-auto
              max-w-2xl
              text-muted-foreground
            "
          >
            Join the discussion, share opinions and connect with football fans
            all over the world.
          </p>
        </motion.div>

        <div
          className="
            mt-12
            grid
            gap-6
            md:grid-cols-3
          "
        >
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <CommunityPreviewSkeleton key={index} />
            ))}

          {!loading &&
            !error &&
            posts.map((post) => (
              <CommunityPreviewCard
                key={post._id}
                post={post}
              />
            ))}

          {(showEmpty || showError) && (
            <div
              className="
                col-span-full
                rounded-3xl
                border
                border-border
                bg-card/60
                p-8
                text-center
                backdrop-blur
              "
            >
              <MessageCircle
                className="
                  mx-auto
                  h-8
                  w-8
                  text-muted-foreground
                "
              />

              <p
                className="
                  mt-3
                  font-medium
                "
              >
                {showError
                  ? 'Unable to load community discussions.'
                  : 'No community discussions yet.'}
              </p>

              <p
                className="
                  mt-1
                  text-s
                  text-muted-foreground
                "
              >
                {showError
                  ? 'Please try again later.'
                  : 'Be the first to start a conversation.'}
              </p>
            </div>
          )}
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            mt-12
            flex
            justify-center
          "
        >
          <Link href="/community">
            <Button
              size="lg"
              className="
                group
                gap-2
                rounded-full
                px-7
              "
            >
              Join The Conversation

              <ArrowRight
                className="
                  h-5
                  w-5
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}