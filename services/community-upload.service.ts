import api from '@/lib/axios';


export interface CommunityUploadResponse {

  url:string;

  publicId:string;

  width?:number;

  height?:number;

  format?:string;

  bytes?:number;

}



export const communityUploadService = {


  async uploadMedia(
    file:File,
  ):Promise<CommunityUploadResponse>{


    const formData =
      new FormData();


    formData.append(
      'image',
      file,
    );


    const res =
      await api.post(
        '/uploads/community',
        formData,
        {
          headers:{
            'Content-Type':
              'multipart/form-data',
          },
        },
      );


    return res.data.data;


  },


};