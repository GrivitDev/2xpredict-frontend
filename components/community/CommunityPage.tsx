'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  Loader2,
  LogIn,
  Users,
} from 'lucide-react';

import StadiumBackground from './StadiumBackground';
import CommunityHeader from './CommunityHeader';
import CommunityError from './CommunityError';
import CommunityFeed from './feed/CommunityFeed';
import CreateDiscussionModal from './create/CreateDiscussionModal';
import CreateMediaPostModal from './create/CreateMediaPostModal';

import { useCommunity } from '@/hooks/useCommunity';

import type {
  CreatePostPayload,
} from '@/services/community.service';

import { useAuth } from '@/providers/auth-provider';

export default function CommunityPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    posts,
    loading,
    error,
    refresh,
    searchPosts,
    createPost,
    react,
    replies,
    repliesLoading,
    loadReplies,
    createReply,
  } = useCommunity();

  const [search, setSearch] = useState('');
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  /*
   * FILTER POSTS
   */
  const filteredPosts = posts.filter((post) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      post.title
        ?.toLowerCase()
        .includes(query) ||
      post.username
        .toLowerCase()
        .includes(query)
    );
  });

  /*
   * SEARCH
   */
  function handleSearch(value: string) {
    setSearch(value);

    if (!value.trim()) {
      void refresh();
      return;
    }

    void searchPosts(value);
  }

  /*
   * RETRY
   */
  function handleRetry() {
    void refresh();

    toast.success(
      'Community refreshed',
    );
  }

  /*
   * CREATE POST
   */
  async function handleCreatePost(
    data: CreatePostPayload,
  ) {
    try {
      await createPost(data);

      toast.success(
        'Post published successfully',
      );

      setDiscussionOpen(false);
      setMediaOpen(false);
    } catch {
      toast.error(
        'Unable to create post',
      );
    }
  }

  /*
   * AUTHENTICATION LOADING
   */
  if (authLoading) {
    return (
      <StadiumBackground>
        <main
          className="
            flex
            min-h-[55vh]
            items-center
            justify-center
            px-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-muted-foreground
            "
          >
            <Loader2
              className="
                size-4
                animate-spin
                text-primary
              "
            />

            Checking your account...
          </div>
        </main>
      </StadiumBackground>
    );
  }

  /*
   * NOT LOGGED IN
   */
  if (!user) {
    return (
      <StadiumBackground>
        <main
          className="
            mx-auto
            flex
            min-h-[65vh]
            max-w-lg
            items-center
            justify-center
            px-4
            py-8
          "
        >
          <div
            className="
              w-full
              rounded-2xl
              border
              border-border
              bg-card/80
              p-5
              text-center
              shadow-lg
              backdrop-blur-md
              sm:p-7
            "
          >
            <div
              className="
                mx-auto
                flex
                size-12
                items-center
                justify-center
                rounded-xl
                bg-primary/10
                text-primary
              "
            >
              <Users className="size-6" />
            </div>

            <h1
              className="
                mt-4
                text-xl
                font-semibold
                tracking-tight
                text-foreground
                sm:text-2xl
              "
            >
              Join the Football Community
            </h1>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-sm
                leading-5
                text-muted-foreground
              "
            >
              Please login to connect with football
              fans, join conversations, share your
              thoughts, and be part of the Football
              Community.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  '/login?redirect=/community',
                )
              }
              className="
                mt-5
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-primary
                px-4
                py-2.5
                text-sm
                font-semibold
                text-primary-foreground
                shadow-sm
                transition-colors
                hover:bg-primary/90
                active:scale-[0.98]
                sm:w-auto
              "
            >
              <LogIn className="size-4" />
              Login to Join
            </button>
          </div>
        </main>
      </StadiumBackground>
    );
  }

  /*
   * AUTHENTICATED COMMUNITY
   */
  return (
    <StadiumBackground>
      <CommunityHeader
        search={search}
        onSearch={handleSearch}
        onDiscussion={() =>
          setDiscussionOpen(true)
        }
        onMedia={() =>
          setMediaOpen(true)
        }
      />

      {error ? (
        <CommunityError
          message={error}
          onRetry={handleRetry}
        />
      ) : (
        <main
          className="
            mx-auto
            mt-6
            max-w-4xl
            px-3
            py-4
            sm:px-5
            lg:px-6
          "
        >
          <CommunityFeed
            posts={filteredPosts}
            loading={loading}
            replies={replies}
            repliesLoading={repliesLoading}
            loadReplies={loadReplies}
            createReply={createReply}
            onReact={react}
          />
        </main>
      )}

      <CreateDiscussionModal
        open={discussionOpen}
        onOpenChange={setDiscussionOpen}
        createPost={handleCreatePost}
      />

      <CreateMediaPostModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        createPost={handleCreatePost}
      />
    </StadiumBackground>
  );
}