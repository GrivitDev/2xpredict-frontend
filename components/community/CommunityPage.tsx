'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  toast,
} from 'sonner';

import StadiumBackground from './StadiumBackground';
import CommunityHeader from './CommunityHeader';
import CommunityError from './CommunityError';
import CommunityFeed from './feed/CommunityFeed';
import CreateDiscussionModal from './create/CreateDiscussionModal';
import CreateMediaPostModal from './create/CreateMediaPostModal';

import {
  useCommunity,
} from '@/hooks/useCommunity';

import type {
  CreatePostPayload,
} from '@/services/community.service';

import {
  useAuth,
} from '@/providers/auth-provider';

import {
  Loader2,
  LogIn,
  Users,
} from 'lucide-react';


export default function CommunityPage() {


  const router =
    useRouter();


  const {
    user,
    loading: authLoading,
  } =
    useAuth();



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
  } =
    useCommunity();



  const [
    search,
    setSearch,
  ] =
    useState('');



  const [
    discussionOpen,
    setDiscussionOpen,
  ] =
    useState(false);



  const [
    mediaOpen,
    setMediaOpen,
  ] =
    useState(false);



  /*
   * ========================================
   * FILTER POSTS
   * ========================================
   */

  const filteredPosts =
    posts.filter(
      post => {

        const query =
          search
            .toLowerCase()
            .trim();


        if (
          !query
        ) {

          return true;

        }


        return (
          post.title
            ?.toLowerCase()
            .includes(
              query,
            )
          ||
          post.username
            .toLowerCase()
            .includes(
              query,
            )
        );

      },
    );



  /*
   * ========================================
   * SEARCH
   * ========================================
   */

  function handleSearch(
    value: string,
  ) {

    setSearch(
      value,
    );


    if (
      !value.trim()
    ) {

      void refresh();

      return;

    }


    void searchPosts(
      value,
    );

  }



  /*
   * ========================================
   * RETRY
   * ========================================
   */

  function handleRetry() {

    void refresh();


    toast.success(
      'Community refreshed',
    );

  }



  /*
   * ========================================
   * CREATE POST
   * ========================================
   */

  async function handleCreatePost(
    data: CreatePostPayload,
  ) {

    try {

      await createPost(
        data,
      );


      toast.success(
        'Post published successfully',
      );


      setDiscussionOpen(
        false,
      );


      setMediaOpen(
        false,
      );

    }
    catch {

      toast.error(
        'Unable to create post',
      );

    }

  }



  /*
   * ========================================
   * AUTHENTICATION LOADING
   * ========================================
   *
   * Wait until we know whether the user
   * is logged in before deciding what to show.
   */

  if (
    authLoading
  ) {

    return (

      <StadiumBackground>

        <main
          className="
            flex
            min-h-[60vh]
            items-center
            justify-center
            px-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              text-sm
              text-muted-foreground
            "
          >

            <Loader2
              className="
                h-5
                w-5
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
   * ========================================
   * NOT LOGGED IN
   * ========================================
   */

  if (
    !user
  ) {

    return (

      <StadiumBackground>

        <main
          className="
            mx-auto
            flex
            min-h-[70vh]
            max-w-2xl
            items-center
            justify-center
            px-4
            py-12
            sm:px-6
          "
        >

          <div
            className="
              w-full
              rounded-3xl
              border
              border-border
              bg-card/70
              p-8
              text-center
              shadow-xl
              backdrop-blur-xl
              sm:p-12
            "
          >

            {/* ICON */}

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-primary/10
                text-primary
              "
            >

              <Users
                className="
                  h-8
                  w-8
                "
              />

            </div>



            {/* TITLE */}

            <h1
              className="
                mt-6
                text-2xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-3xl
              "
            >

              Join the Football Community

            </h1>



            {/* DESCRIPTION */}

            <p
              className="
                mx-auto
                mt-4
                max-w-md
                text-sm
                leading-6
                text-muted-foreground
                sm:text-base
              "
            >

              Please login to connect with football
              fans, join conversations, share your
              thoughts, and be part of the Football
              Community.

            </p>



            {/* LOGIN BUTTON */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  '/login?redirect=/community',
                )
              }
              className="
                mt-8
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                py-3
                text-sm
                font-semibold
                text-primary-foreground
                shadow-lg
                shadow-primary/20
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:bg-primary/90
                hover:shadow-xl
                hover:shadow-primary/25
                active:scale-[0.98]
                sm:w-auto
              "
            >

              <LogIn
                className="
                  h-4
                  w-4
                "
              />

              Login to Join

            </button>

          </div>

        </main>

      </StadiumBackground>

    );

  }



  /*
   * ========================================
   * AUTHENTICATED COMMUNITY
   * ========================================
   */

  return (

    <StadiumBackground>

      <CommunityHeader
        search={search}
        onSearch={handleSearch}
        onDiscussion={() =>
          setDiscussionOpen(
            true,
          )
        }
        onMedia={() =>
          setMediaOpen(
            true,
          )
        }
      />



      {
        error

          ?

          <CommunityError
            message={error}
            onRetry={handleRetry}
          />

          :

          <main
            className="
              mx-auto
              max-w-4xl
              px-4
              py-6
              sm:px-6
              lg:px-8
              mt-8
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
      }



      <CreateDiscussionModal
        open={discussionOpen}
        onOpenChange={
          setDiscussionOpen
        }
        createPost={
          handleCreatePost
        }
      />



      <CreateMediaPostModal
        open={mediaOpen}
        onOpenChange={
          setMediaOpen
        }
        createPost={
          handleCreatePost
        }
      />

    </StadiumBackground>

  );

}