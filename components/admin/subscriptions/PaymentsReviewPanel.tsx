'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import {
  CheckCircle2,
  XCircle,
  Wallet,
  Clock3,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  getPendingPayments,
  approvePayment,
  rejectPayment,
} from '@/services/admin-payments.service';

import { useAdminRealtime } from '@/hooks/useAdminRealtime';


export default function PaymentsReviewPanel({
  token,
}: {
  token: string;
}) {

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);



  const load = async () => {

    try {

      const data = await getPendingPayments(token);

      setPayments(data);


    } catch {

      toast.error(
        'Unable to load pending payments'
      );


    } finally {

      setLoading(false);

    }

  };




  useEffect(() => {

    load();

  }, [token]);





  useAdminRealtime((event, data) => {


    if (event === 'payment:new') {

      setPayments((prev) => [
        data,
        ...prev,
      ]);

      toast.success(
        'New payment received'
      );

    }



    if (event === 'payment:update') {

      setPayments((prev) =>
        prev.filter(
          (payment) =>
            payment._id !== data._id,
        ),
      );

    }


  });





  const approve = async (
    id: string,
  ) => {

    try {

      setProcessing(id);

      await approvePayment(
        token,
        id,
      );

      toast.success(
        'Payment approved'
      );

      await load();


    } catch {

      toast.error(
        'Failed to approve payment'
      );


    } finally {

      setProcessing(null);

    }

  };





  const reject = async (
    id: string,
  ) => {

    try {

      setProcessing(id);

      await rejectPayment(
        token,
        id,
      );


      toast.success(
        'Payment rejected'
      );


      await load();


    } catch {

      toast.error(
        'Failed to reject payment'
      );


    } finally {

      setProcessing(null);

    }

  };






  if (loading) {

    return (

      <div className="
        rounded-3xl
        border
        bg-card/70
        p-6
        backdrop-blur-xl
      ">

        <div className="
          h-6
          w-52
          animate-pulse
          rounded-lg
          bg-muted
        "/>


        <div className="
          mt-6
          h-32
          animate-pulse
          rounded-2xl
          bg-muted
        "/>

      </div>

    );

  }







  return (

    <div className="
      relative
      overflow-hidden
      rounded-3xl
      border
      bg-card/70
      p-6
      backdrop-blur-xl
    ">


      {/* Header */}

      <div className="
        flex
        items-center
        justify-between
      ">


        <div className="
          flex
          items-center
          gap-4
        ">


          <div className="
            rounded-2xl
            bg-primary/10
            p-4
          ">

            <Wallet className="
              h-6
              w-6
              text-primary
            "/>

          </div>



          <div>

            <h3 className="
              text-xl
              font-semibold
            ">
              Payment Verification
            </h3>


            <p className="
              text-sm
              text-muted-foreground
            ">
              Review and approve subscription payments.
            </p>

          </div>


        </div>





        <div className="
          flex
          items-center
          gap-2
          rounded-full
          border
          bg-orange-500/10
          px-4
          py-2
          text-sm
          text-orange-600
        ">


          <Clock3 className="h-4 w-4"/>


          {payments.length}
          {' '}
          Pending


        </div>


      </div>








      {/* Empty */}

      {payments.length === 0 && (

        <div className="
          mt-8
          rounded-2xl
          border
          border-dashed
          p-10
          text-center
        ">


          <CheckCircle2 className="
            mx-auto
            h-10
            w-10
            text-green-500
          "/>



          <h4 className="
            mt-4
            font-semibold
          ">
            Everything is clear
          </h4>


          <p className="
            mt-2
            text-sm
            text-muted-foreground
          ">
            No pending payments require attention.
          </p>


        </div>

      )}







      {/* Payments */}

      <div className="
        mt-8
        space-y-5
      ">


        {payments.map((payment)=>(


          <div

            key={payment._id}

            className="
              rounded-2xl
              border
              bg-background/50
              p-5
              transition
              hover:shadow-lg
            "

          >



            <div className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:justify-between
            ">



              <div
                className="
                  space-y-2
                "
              >

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <AlertTriangle className="
                    h-4
                    w-4
                    text-orange-500
                  "/>


                  <span className="
                    text-sm
                    font-medium
                  ">
                    Awaiting Approval
                  </span>


                </div>



                <p>
                  <span className="text-muted-foreground">
                    Type:
                  </span>
                  {' '}
                  {payment.type}
                </p>


                <p>
                  <span className="text-muted-foreground">
                    Amount:
                  </span>
                  {' '}
                  ₦{payment.amount}
                </p>


                <p>
                  <span className="text-muted-foreground">
                    User:
                  </span>
                  {' '}
                  {payment.email}
                </p>


              </div>






              {payment.proofImageUrl && (

                <a
                  href={payment.proofImageUrl}
                  target="_blank"
                  className="
                    relative
                    h-32
                    w-full
                    overflow-hidden
                    rounded-xl
                    border
                    lg:w-48
                  "
                >

                  <Image
                    src={payment.proofImageUrl}
                    alt="Payment proof"
                    fill
                    className="object-cover"
                  />

                  <ExternalLink className="
                    absolute
                    right-2
                    top-2
                    h-5
                    w-5
                    rounded
                    bg-background
                    p-1
                  "/>

                </a>

              )}


            </div>






            <div className="
              mt-5
              flex
              gap-3
            ">


              <button

                disabled={processing === payment._id}

                onClick={() =>
                  approve(payment._id)
                }

                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-green-600
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-green-500
                  disabled:opacity-50
                "
              >

                <CheckCircle2 className="h-4 w-4"/>

                Approve

              </button>





              <button

                disabled={processing === payment._id}

                onClick={() =>
                  reject(payment._id)
                }

                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-destructive
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:opacity-90
                  disabled:opacity-50
                "
              >

                <XCircle className="h-4 w-4"/>

                Reject

              </button>


            </div>



          </div>


        ))}


      </div>


    </div>

  );

}