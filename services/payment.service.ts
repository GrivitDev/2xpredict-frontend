import api from '@/lib/axios';



export interface CreatePaymentPayload {


  type:
    | 'subscription'
    | 'prediction'
    | 'vip_upgrade';



  target:string;



  transferReference?:string;



  proofImageUrl?:string;



  proofPublicId?:string;



  proofMessage?:string;

}





export const paymentService = {



  async getMyPayments(){


    const res =
      await api.get(
        '/payments/me',
      );


    return res.data;


  },







  async createPayment(
    data:CreatePaymentPayload,
  ){


    const res =
      await api.post(
        '/payments',
        data,
      );


    return res.data;


  },



};