import api from '@/lib/axios';


export const predictionPurchaseService = {


  async initialize(predictionId:string){

    const res = await api.post(
      '/purchases/initialize',
      {
        predictionId,
      },
    );


    return res.data;

  },



  async getMyPurchases(){

    const res = await api.get(
      '/purchases/me',
    );


    return res.data;

  },


};