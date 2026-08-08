'use client';

import { useState } from 'react';

import {
  CheckCircle2,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';

import api from '@/lib/axios';

import type { PlanConfig } from '@/types/plan-config';

import PaymentProofUpload from './PaymentProofUpload';



interface PaymentModalProps {

  type:
    | 'subscription'
    | 'vip_upgrade'
    | 'prediction';

  target:string;

  amount:number;

  config:PlanConfig;

  title?:string;

  description?:string;

  onClose:()=>void;

}



export default function PaymentModal({
  type,
  target,
  amount,
  config,
  title,
  description,
  onClose,
}:PaymentModalProps){


  const [transferReference,setTransferReference] =
    useState('');


  const [proofMessage,setProofMessage] =
    useState('');


  const [proof,setProof] =
    useState<{
      url:string;
      publicId:string;
    } | null>(null);



  const [error,setError] =
    useState('');


  const [loading,setLoading] =
    useState(false);


  const [success,setSuccess] =
    useState(false);




  async function submitPayment(){


    setError('');



    if(!transferReference.trim()){

      setError(
        'Please enter your payment reference or account name used for transfer.',
      );

      return;

    }



    if(!proof){

      setError(
        'Please upload your payment screenshot before submitting.',
      );

      return;

    }



    try{


      setLoading(true);



      await api.post(
        '/payments',
        {

          type,

          target,

          transferReference:
            transferReference.trim(),

          proofMessage:
            proofMessage.trim(),

          proofImageUrl:
            proof.url,

          proofPublicId:
            proof.publicId,

        },
      );



      setSuccess(true);



    }catch(error:any){


      const message =
        error.response?.data?.message ||
        'Something went wrong while submitting payment. Please try again.';



      setError(
        Array.isArray(message)
          ? message[0]
          : message,
      );


    }finally{


      setLoading(false);


    }


  }





  const paymentLabel =
    type === 'prediction'
      ? 'Prediction Purchase'
      : (target || '').toUpperCase();





  return (

    <div
      className="
        fixed
        inset-0
        z-50
        overflow-y-auto
        bg-black/60
        p-4
        pt-8
        pb-8
        backdrop-blur-md
        sm:flex
        sm:items-center
        sm:justify-center
      "
    >


      <div
        className="
          relative
          mx-auto
          flex
          max-h-[calc(100vh-4rem)]
          w-full
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-border/60
          bg-background
          shadow-2xl
          sm:max-w-2xl
        "
      >



        <button
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            z-10
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            bg-background/70
            backdrop-blur
            transition-all
            hover:scale-105
            hover:bg-muted
          "
        >

          <X size={20}/>

        </button>




        <div
          className="
            overflow-y-auto
            px-5
            pb-8
            pt-16
            sm:px-8
            sm:pt-8
          "
        >

                  {
          success ? (

            <div
              className="
                flex
                flex-col
                items-center
                py-10
                text-center
              "
            >

              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  rounded-full
                  bg-green-500/10
                  ring-8
                  ring-green-500/5
                "
              >

                <CheckCircle2
                  size={45}
                  className="text-green-500"
                />

              </div>



              <h2
                className="
                  mt-6
                  text-3xl
                  font-black
                "
              >

                Payment Submitted

              </h2>



              <p
                className="
                  mt-3
                  max-w-sm
                  text-muted-foreground
                "
              >

                Your payment has been received and is
                waiting for admin approval. Your account
                will automatically update once approved.

              </p>



              <button
                onClick={onClose}
                className="
                  mt-8
                  w-full
                  rounded-2xl
                  bg-primary
                  py-3
                  font-bold
                  text-primary-foreground
                  shadow-lg
                  shadow-primary/20
                  transition
                  hover:opacity-90
                "
              >

                Continue

              </button>


            </div>


          ) : (


            <>


              <div
                className="
                  rounded-3xl
                  border-b
                  border-border/50
                  bg-gradient-to-b
                  from-primary/10
                  via-primary/5
                  to-transparent
                  px-6
                  py-7
                "
              >

                <p
                  className="
                    text-sm
                    font-semibold
                    text-primary
                  "
                >

                  {paymentLabel}

                </p>



                <h2
                  className="
                    mt-2
                    text-3xl
                    font-black
                    tracking-tight
                  "
                >

                  {title || 'Complete Payment'}

                </h2>



                  <p
                    className="
                      mt-3
                      text-muted-foreground
                    "
                  >

                    {
                      description ||
                      'Transfer the amount below and upload your payment proof.'
                    }

                  </p>


                  <p
                    className="
                      mt-3
                      rounded-xl
                      border
                      border-primary/20
                      bg-primary/5
                      p-3
                      text-sm
                      text-muted-foreground
                    "
                  >

                    After submitting your payment, please allow the admin about 30 minutes to confirm your payment and activate your subscription.

                  </p>


              </div>






              <div
                className="
                  mt-8
                  rounded-3xl
                  border
                  border-primary/15
                  bg-gradient-to-br
                  from-primary/10
                  to-primary/5
                  p-7
                  shadow-sm
                "
              >

                <p
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >

                  Amount to pay

                </p>



                <p
                  className="
                    mt-2
                    text-5xl
                    font-black
                    tracking-tight
                  "
                >

                  ₦{amount.toLocaleString()}

                </p>




                {
                  type !== 'prediction' && (

                    <p
                      className="
                        mt-3
                        text-sm
                        text-muted-foreground
                      "
                    >

                      Valid for {
                        config.subscriptionDurationDays
                      } days

                    </p>

                  )
                }


              </div>







              <div
                className="
                  mt-8
                  rounded-3xl
                  border
                  border-border/60
                  bg-card
                  p-6
                  shadow-sm
                "
              >

                <h3
                  className="
                    font-bold
                  "
                >

                  Bank Transfer Details

                </h3>



                <div
                  className="
                    mt-5
                    space-y-3
                    text-sm
                  "
                >

                  <p>

                    Bank:
                    {' '}
                    {config.bankDetails.bankName}

                  </p>



                  <p>

                    Account Name:
                    {' '}
                    {config.bankDetails.accountName}

                  </p>



                  <p>

                    Account Number:
                    {' '}
                    {config.bankDetails.accountNumber}

                  </p>




                  {
                    config.bankDetails.instructions && (

                      <p
                        className="
                          pt-3
                          text-muted-foreground
                        "
                      >

                        {config.bankDetails.instructions}

                      </p>

                    )
                  }


                </div>


              </div>

                            <div
                className="
                  mt-8
                  space-y-5
                "
              >


                <PaymentProofUpload

                  onUpload={(data)=>{

                    setProof(data);

                    setError('');

                  }}

                />





                <input

                  value={transferReference}

                  onChange={(e)=>{

                    setTransferReference(
                      e.target.value,
                    );

                    setError('');

                  }}

                  placeholder="
                    Transfer reference / sender name
                  "

                  className="
                    w-full
                    rounded-2xl
                    border
                    border-border/60
                    bg-muted/30
                    px-4
                    py-3.5
                    outline-none
                    transition-all
                    focus:border-primary
                    focus:bg-background
                    focus:ring-4
                    focus:ring-primary/10
                  "

                />







                <textarea

                  value={proofMessage}

                  onChange={(e)=>
                    setProofMessage(
                      e.target.value,
                    )
                  }

                  placeholder="
                    Additional information (optional)
                  "

                  className="
                    min-h-28
                    w-full
                    rounded-2xl
                    border
                    border-border/60
                    bg-muted/30
                    px-4
                    py-3.5
                    outline-none
                    transition-all
                    focus:border-primary
                    focus:bg-background
                    focus:ring-4
                    focus:ring-primary/10
                  "

                />


              </div>








              {
                error && (

                  <div
                    className="
                      mt-6
                      rounded-2xl
                      border
                      border-red-500/20
                      bg-red-500/10
                      p-4
                      text-sm
                      text-red-500
                    "
                  >

                    {error}

                  </div>

                )
              }








              <button

                disabled={loading}

                onClick={submitPayment}

                className="
                  mt-8
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-primary
                  font-bold
                  text-primary-foreground
                  shadow-lg
                  shadow-primary/20
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  disabled:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "

              >

                {
                  loading ? (

                    <>

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Processing...

                    </>


                  ) : (

                    <>

                      <UploadCloud
                        size={18}
                      />

                      Submit Payment

                    </>

                  )
                }


              </button>


            </>

          )

        }


        </div>


      </div>


    </div>

  );

}