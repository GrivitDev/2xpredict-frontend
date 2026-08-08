import api from '@/lib/axios';


export const sessionService={

 async getMySessions(){

  const response =
   await api.get(
    '/sessions/me',
   );

  return response.data;

 },


 async logoutAll(){

  const response =
   await api.patch(
    '/sessions/logout-all',
   );

  return response.data;

 },


 async logoutCurrent(){

  const response =
   await api.patch(
    '/sessions/current/logout',
   );

  return response.data;

 },

};