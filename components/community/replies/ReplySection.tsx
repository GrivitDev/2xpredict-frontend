'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  motion,
} from 'framer-motion';

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

  createReply:
    (
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
      : replies.slice(
          0,
          3,
        );


  return (

    <div
      className="
        mt-2
        space-y-3
      "
    >

      {
        loading

          ? (

            <ReplySkeleton />

          )

          : replies.length > 0

            ? (

              <div
                className="
                  space-y-2
                "
              >

                {
                  visibleReplies.map(
                    reply => (

                      <motion.div
                        key={
                          reply._id
                        }
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                      >

                        <ReplyCard
                          reply={
                            reply
                          }
                        />

                      </motion.div>

                    ),
                  )
                }

              </div>

            )

            : (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-border
                  bg-muted/20
                  px-4
                  py-5
                  text-center
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  No replies yet
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  Be the first to share your thought...
                </p>

              </motion.div>

            )
      }


      <ReplyForm
        onSubmit={
          createReply
        }
      />


      {
        replyCount > 3 &&
        !expanded &&
        replies.length > 3 && (

          <button
            type="button"
            onClick={
              handleExpand
            }
            className="
              text-sm
              font-semibold
              text-emerald-500
              transition
              hover:text-emerald-400
            "
          >
            Read more replies →
          </button>

        )
      }


      {
        expanded &&
        replies.length > 3 && (

          <button
            type="button"
            onClick={() => (
              setExpanded(false)
            )}
            className="
              text-sm
              font-semibold
              text-muted-foreground
              transition
              hover:text-foreground
            "
          >
            Show less ↑
          </button>

        )
      }

    </div>

  );

}