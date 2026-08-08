import api from '@/lib/axios';



export const planConfigService = {



  async get(){

    const res =
      await api.get(
        '/plan-config',
      );


    return res.data;

  },


};