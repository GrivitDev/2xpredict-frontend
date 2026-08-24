import api from '@/lib/axios';

import type { UserSession } from '@/types/session';


export const sessionService = {

  async getMySessions(): Promise<UserSession[]> {

    const response =
      await api.get<UserSession[]>(
        '/sessions/me',
      );

    return response.data;

  },


  async logoutAll() {

    const response =
      await api.patch(
        '/sessions/logout-all',
      );

    return response.data;

  },


  async logoutCurrent() {

    const response =
      await api.patch(
        '/sessions/current/logout',
      );

    return response.data;

  },

};