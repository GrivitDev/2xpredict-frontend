'use client';


import {
  useCallback,
  useEffect,
  useState,
} from 'react';


import {
  communityService,
  type CommunityPost,
  type CommunityReply,
  type CreatePostPayload,
  type UpdatePostPayload,
} from '@/services/community.service';



export function useCommunity() {


  const [
    posts,
    setPosts,
  ] = useState<CommunityPost[]>([]);



  const [
    loading,
    setLoading,
  ] = useState(false);



  const [
    submitting,
    setSubmitting,
  ] = useState(false);



  const [
    error,
    setError,
  ] = useState<string | null>(null);



  const [
    page,
    setPage,
  ] = useState(1);



  const [
    totalPages,
    setTotalPages,
  ] = useState(1);



  const [
    replies,
    setReplies,
  ] = useState<
    Record<string, CommunityReply[]>
  >({});



  const [
    repliesLoading,
    setRepliesLoading,
  ] = useState<
    Record<string, boolean>
  >({});





  const fetchPosts =
    useCallback(
      async(
        params?: {
          page?:number;

          search?:string;
        },
      )=>{


        try {


          setLoading(true);

          setError(null);



          const data =
            await communityService.getPosts(
              params,
            );



          setPosts(
            data.posts,
          );



          setPage(
            data.page,
          );



          setTotalPages(
            data.totalPages,
          );


        }
        catch {


          setError(
            'Failed to load community posts.',
          );


        }
        finally {


          setLoading(false);


        }


      },
      [],
    );







  useEffect(()=>{


    const loadPosts = async () => {
      await fetchPosts();
    };

    void loadPosts();


  },[
    fetchPosts,
  ]);









const loadReplies =
  useCallback(
    async(
      id:string,
    )=>{


      try {


        setRepliesLoading(
          current=>({

            ...current,

            [id]:true,

          }),
        );


        const data =
          await communityService.getPost(
            id,
          );


        setReplies(
          current=>({

            ...current,

            [id]:
              data.replies,

          }),
        );


      }
      catch {


        setError(
          'Failed to load replies.',
        );


      }
      finally {


        setRepliesLoading(
          current=>({

            ...current,

            [id]:false,

          }),
        );


      }


    },
    [],
  );








  const createReply =
    async(
      id:string,
      message:string,
    )=>{


      try {


        const reply =
          await communityService.reply(
            id,
            message,
          );



        setReplies(
          current=>({

            ...current,

            [id]:[
              ...(current[id] || []),

              reply,

            ],

          }),
        );



        setPosts(
          current=>

            current.map(
              post=>

                post._id === id

                ?

                {
                  ...post,

                  replyCount:
                    post.replyCount + 1,
                }

                :

                post,
            ),

        );


      }
      catch {


        throw new Error(
          'Failed to send reply.',
        );


      }


    };









  const createPost =
    async(
      data:CreatePostPayload,
    )=>{


      try {


        setSubmitting(true);



        await communityService.createPost(
          data,
        );



        await fetchPosts();


      }
      finally {


        setSubmitting(false);


      }


    };









  const updatePost =
    async(
      id:string,
      data:UpdatePostPayload,
    )=>{


      const updated =
        await communityService.updatePost(
          id,
          data,
        );



      setPosts(
        current=>

          current.map(
            item=>

              item._id === id

              ?

              updated

              :

              item,

          ),
      );


    };









  const deletePost =
    async(
      id:string,
    )=>{


      await communityService.deletePost(
        id,
      );



      setPosts(
        current=>

          current.filter(
            item=>

              item._id !== id,

          ),
      );


    };









  const react =
    async(
      id:string,
      reaction:string,
    )=>{


      const updated =
        await communityService.react(
          id,
          reaction,
        );



      setPosts(
        current=>

          current.map(
            item=>

              item._id === id

              ?

              updated

              :

              item,

          ),
      );


    };









  const searchPosts =
    async(
      search:string,
    )=>{


      await fetchPosts({
        page:1,

        search,
      });


    };









  return {


    posts,


    loading,


    submitting,


    error,


    page,


    totalPages,


    replies,


    repliesLoading,


    createPost,


    updatePost,


    deletePost,


    react,


    searchPosts,


    loadReplies,


    createReply,


    refresh:
      fetchPosts,


  };


}