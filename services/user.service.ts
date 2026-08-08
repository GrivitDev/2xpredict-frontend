import api from '@/lib/axios';
export interface UpdateProfileDto {
  fullName: string;
  phoneNumber?: string;
}


export const userService = {


  async getMe(){

    const response =
      await api.get(
        '/users/me',
      );

    return response.data;
  },


async updateProfile(
  data: UpdateProfileDto,
){

    const response =
      await api.patch(
        '/users/me',
        data,
      );

    return response.data;
  },


  async deleteAccount(){

    const response =
      await api.delete(
        '/users/me',
      );

    return response.data;
  },

};