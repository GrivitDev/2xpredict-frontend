'use client';

import { useMemo } from 'react';

import type {
  CommunityPost,
  CommunityReply,
} from '@/services/community.service';

import {
  CommunityPostType,
} from '@/services/community.service';

import CommunityDiscussionCard from './CommunityDiscussionCard';
import CommunityMediaCard from './CommunityMediaCard';
import CommunityCardSkeleton from './CommunityCardSkeleton';
import CommunityEmptyState from './CommunityEmptyState';

import CommunityFeedAd from './ads/CommunityFeedAd';
import CommunityBottomAd from './ads/CommunityBottomAd';

import {
  generateInsertionPoints,
} from './ads/generateInsertionPoints';

interface Props {
  posts: CommunityPost[];

  loading: boolean;

  replies: Record<
    string,
    CommunityReply[]
  >;

  repliesLoading: Record<
    string,
    boolean
  >;

  loadReplies: (
    id: string,
  ) => Promise<void>;

  createReply: (
    id: string,
    message: string,
  ) => Promise<void>;

  onReact: (
    id: string,
    reaction: string,
  ) => void;
}

export default function CommunityFeed({
  posts,
  loading,
  replies,
  repliesLoading,
  loadReplies,
  createReply,
  onReact,
}: Props) {

  if (loading) {

    return (

      <div
        className="
          space-y-6
        "
      >

        {
          Array.from({
            length: 3,
          }).map((_, index) => (

            <CommunityCardSkeleton
              key={`community-skeleton-${index}`}
            />

          ))
        }

      </div>

    );

  }

  if (!posts.length) {

    return (
      <CommunityEmptyState />
    );

  }

  const insertionPoints =
    useMemo(
      () =>
        generateInsertionPoints(
          posts.length,
        ),
      [posts.length],
    );

  const insertionPointSet =
    useMemo(
      () =>
        new Set(
          insertionPoints,
        ),
      [insertionPoints],
    );

  const feed: React.ReactNode[] = [];

  posts.forEach(
    (
      post,
      index,
    ) => {

      const postReplies =
        replies[post._id] ?? [];

      const isRepliesLoading =
        repliesLoading[post._id] ?? false;

      const handleLoadReplies =
        () =>
          loadReplies(
            post._id,
          );

      const handleCreateReply =
        (
          message: string,
        ) =>
          createReply(
            post._id,
            message,
          );

      const handleReact =
        (
          reaction: string,
        ) =>
          onReact(
            post._id,
            reaction,
          );

      if (
        post.type ===
        CommunityPostType.MEDIA
      ) {

        feed.push(

          <CommunityMediaCard
            key={post._id}
            post={post}
            onReact={handleReact}
            replies={postReplies}
            repliesLoading={
              isRepliesLoading
            }
            loadReplies={
              handleLoadReplies
            }
            createReply={
              handleCreateReply
            }
          />,

        );

      }
      else {

        feed.push(

          <CommunityDiscussionCard
            key={post._id}
            post={post}
            onReact={handleReact}
            replies={postReplies}
            repliesLoading={
              isRepliesLoading
            }
            loadReplies={
              handleLoadReplies
            }
            createReply={
              handleCreateReply
            }
          />,

        );

      }

      if (
        insertionPointSet.has(
          index + 1,
        )
      ) {

        feed.push(

          <CommunityFeedAd
            key={`community-ad-${index}`}
          />,

        );

      }

    },
  );

  return (

    <div
      className="
        space-y-6
      "
    >

      {feed}

      <CommunityBottomAd />

    </div>

  );

}