// /services/user.service.ts

import api from '@/lib/axios';

import type { User } from '@/types/user';


// ============================================================
// TYPES
// ============================================================

export interface UpdateProfileDto {

  fullName: string;

  username?: string;

  phoneNumber?: string;

}


// ============================================================
// USER SERVICE
// ============================================================

export const userService = {

  // ==========================================================
  // GET CURRENT USER
  // ==========================================================

  async getMe(): Promise<User> {

    const response =
      await api.get<User>(
        '/users/me',
      );

    return response.data;

  },


  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  async updateProfile(
    data: UpdateProfileDto,
  ): Promise<User> {

    const response =
      await api.patch<User>(
        '/users/me',
        data,
      );

    return response.data;

  },


  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  async deleteAccount(): Promise<User> {

    const response =
      await api.delete<User>(
        '/users/me',
      );

    return response.data;

  },

};