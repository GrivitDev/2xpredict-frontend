'use client';


import {
  useEffect,
  useState,
} from 'react';


import {
  X,
  CreditCard,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from 'lucide-react';


import toast from 'react-hot-toast';


import {
  paymentService,
} from '@/services/payment.service';


import {
  predictionPurchaseService,
} from '@/services/prediction-purchase.service';


import {
  planConfigService,
} from '@/services/plan-config.service';


import PaymentProofUpload from './PaymentProofUpload';




interface PaymentModalProps {


  open:boolean;


  onClose:()=>void;



  type:
    | 'subscription'
    | 'prediction'
    | 'vip_upgrade';



  target:string;



  predictionId?:string;



}





export default function PaymentModal({

  open,

  onClose,

  type,

  target,

  predictionId,

}:PaymentModalProps){



  const [
    loading,
    setLoading,
  ] = useState(false);



  const [
    config,
    setConfig,
  ] = useState<any>(null);



  const [
    proof,
    setProof,
  ] = useState({

    url:'',

    publicId:'',

  });





const [
  purchaseReference,
  setPurchaseReference,
] = useState('');


const [
  predictionAmount,
  setPredictionAmount,
] = useState<number | null>(null);




useEffect(()=>{


  if(!open){

    return;

  }



  loadConfig();



  if(
    type === 'prediction' &&
    predictionId
  ){

    initializePrediction();

  }


},[
  open,
  type,
  predictionId,
]);






  const loadConfig = async()=>{


    try{


      const data =
        await planConfigService.get();



      setConfig(data);



    }catch{


      toast.error(
        'Unable to load payment information',
      );


    }


  };







  const getAmount = ()=>{


    if(type === 'prediction'){

      return null;

    }



    if(target === 'vip'){

      return config?.vipPrice ?? 0;

    }



    return config?.regularPrice ?? 0;


  };








 const initializePrediction = async()=>{


  if(!predictionId){

    throw new Error(
      'Prediction id missing',
    );

  }



  try{


    const result =
      await predictionPurchaseService.initialize(
        predictionId,
      );



    setPurchaseReference(
      result.reference,
    );



    setPredictionAmount(
      result.amount,
    );



    return result.reference;



  }catch(error){


    toast.error(
      'Unable to initialize prediction purchase',
    );


    throw error;


  }


};








  const submitPayment = async()=>{


    if(!proof.url){


      toast.error(
        'Please upload payment proof first',
      );


      return;

    }






    try{


      setLoading(true);



      let paymentTarget =
        target;




      if(type === 'prediction'){



        paymentTarget =
          purchaseReference ||
          await initializePrediction();


      }






      await paymentService.createPayment({

        type,


        target:paymentTarget,



        proofImageUrl:
          proof.url,



        proofPublicId:
          proof.publicId,


      });





      toast.success(
        'Payment submitted successfully',
      );



      onClose();




    }catch(error:any){


      toast.error(
        error?.response?.data?.message ||
        'Payment submission failed',
      );



    }finally{


      setLoading(false);


    }


  };








  if(!open){

    return null;

  }






  return (


    <div

      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "

    >



      <div

        className="
          relative
          w-full
          max-w-lg
          rounded-3xl
          border
          bg-card
          p-6
          shadow-xl
        "

      >




        <button

          onClick={onClose}

          className="
            absolute
            right-4
            top-4
            rounded-full
            p-2
            hover:bg-muted
          "

        >

          <X className="h-5 w-5"/>


        </button>






        <div

          className="
            mb-6
            flex
            items-center
            gap-3
          "

        >

          <div

            className="
              rounded-xl
              bg-primary/10
              p-3
            "

          >

            <CreditCard
              className="
                h-6
                w-6
                text-primary
              "
            />

          </div>




          <div>

            <h2
              className="
                text-xl
                font-semibold
              "
            >

              Complete Payment

            </h2>


            <p
              className="
                text-sm
                text-muted-foreground
              "
            >

              Upload proof after transfer

            </p>


          </div>


        </div>







        <div

          className="
            mb-6
            rounded-2xl
            border
            bg-muted/30
            p-5
          "

        >


          <p className="text-sm text-muted-foreground">

            Amount

          </p>


          <h3
            className="
              mt-1
              text-3xl
              font-bold
            "
          >

            ₦

            {
            type === 'prediction'
                ? predictionAmount
                ? predictionAmount
                : 'Loading...'
                : getAmount()
            }


          </h3>


        </div>







        {
          config && (


            <div

              className="
                mb-6
                rounded-2xl
                border
                p-5
                text-sm
              "

            >

              <p className="font-semibold">

                Bank Transfer Instructions

              </p>


              <div className="mt-3 space-y-1">


                <p>
                  Bank:
                  {' '}
                  {config.bankDetails.bankName}
                </p>


                <p>
                  Account:
                  {' '}
                  {config.bankDetails.accountNumber}
                </p>


                <p>
                  Name:
                  {' '}
                  {config.bankDetails.accountName}
                </p>



                <p>
                  {config.bankDetails.instructions}
                </p>


              </div>


            </div>


          )
        }






        <PaymentProofUpload

          onUploadComplete={
            (
              url,
              publicId,
            )=>{

              setProof({

                url,

                publicId,

              });

            }
          }

        />






        <button


          disabled={loading || !proof.url}


          onClick={submitPayment}



          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-5
            py-3
            font-semibold
            text-primary-foreground
            disabled:opacity-50
          "


        >


          {
            loading ? (


              <Loader2
                className="
                  h-5
                  w-5
                  animate-spin
                "
              />


            ):(


              <CheckCircle2
                className="
                  h-5
                  w-5
                "
              />


            )
          }


          {
            loading
              ? 'Submitting...'
              : 'Submit Payment'
          }



        </button>



      </div>


    </div>


  );


}