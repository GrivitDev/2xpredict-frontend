import api from '@/lib/axios';


export enum CommunityPostType {

  DISCUSSION = 'discussion',

  MEDIA = 'media',

}



export enum CommunityMediaType {

  IMAGE = 'image',

  VIDEO = 'video',

}



export interface CommunityMedia {

  type:CommunityMediaType;

  url:string;

  publicId:string;

  width?:number;

  height?:number;

  format?:string;

  bytes?:number;

}



export interface CreatePostPayload {

  type:CommunityPostType;

  title?:string;

  message?:string;

  category?:string;

  media?:CommunityMedia;

}



export interface UpdatePostPayload {

  type?:CommunityPostType;

  title?:string;

  message?:string;

  category?:string;

  media?:CommunityMedia;

}



export interface CommunityPost {


  _id:string;


  type:CommunityPostType;


  title?:string;


  message?:string;


  username:string;


  fullName:string;


  category?:string;


  media?:CommunityMedia;


  replyCount:number;


  reactions?:Record<string,number>;


  isFeatured:boolean;


  isPinned:boolean;


  isLocked:boolean;


  createdAt:string;


  updatedAt:string;

}



export interface CommunityReply {


  _id:string;


  postId:string;


  username:string;


  fullName:string;


  message:string;


  createdAt:string;

}

export const communityService = {



  async getPosts(
    params?:{
      page?:number;

      search?:string;
    },
  ):Promise<{
    posts:CommunityPost[];

    page:number;

    total:number;

    totalPages:number;
  }> {


    const res =
      await api.get(
        '/community',
        {
          params,
        },
      );


    return res.data;

  },







  async getFeatured():Promise<CommunityPost[]> {


    const res =
      await api.get(
        '/community/featured',
      );


    return res.data;

  },







  async getPost(
    id:string,
  ):Promise<CommunityPost & {
    replies:CommunityReply[];
  }> {


    const res =
      await api.get(
        `/community/${id}`,
      );


    return res.data;

  },







  async createPost(
    data:CreatePostPayload,
  ):Promise<CommunityPost> {


    const res =
      await api.post(
        '/community',
        data,
      );


    return res.data;

  },







  async updatePost(
    id:string,
    data:UpdatePostPayload,
  ):Promise<CommunityPost> {


    const res =
      await api.patch(
        `/community/${id}`,
        data,
      );


    return res.data;

  },







  async deletePost(
    id:string,
  ) {


    const res =
      await api.delete(
        `/community/${id}`,
      );


    return res.data;

  },







  async react(
    id:string,
    emoji:string,
  ):Promise<CommunityPost> {


    const res =
      await api.post(
        `/community/${id}/react`,
        {
          emoji,
        },
      );


    return res.data;

  },







  async reply(
    id:string,
    message:string,
  ):Promise<CommunityReply> {


    const res =
      await api.post(
        `/community/${id}/reply`,
        {
          message,
        },
      );


    return res.data;

  },

};