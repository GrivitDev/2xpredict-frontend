'use client';

import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

type Props = {
  summary: {
    totalRevenue: number;
    subscriptionRevenue: number;
    predictionRevenue: number;
    totalPayments: number;
    approvedPayments: number;
    pendingPayments: number;
    rejectedPayments: number;
  };
};


const money = (amount:number) =>
  new Intl.NumberFormat('en-NG',{
    style:'currency',
    currency:'NGN',
    maximumFractionDigits:0,
  }).format(amount);



export default function PaymentSummaryCard({
  summary,
}:Props){


  const approvalRate =
    summary.totalPayments
      ?
      Math.round(
        (
          summary.approvedPayments /
          summary.totalPayments
        ) * 100
      )
      :
      0;



  return (

    <div className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      bg-card/60
      p-6
      shadow-xl
      backdrop-blur-xl
      transition
      hover:-translate-y-1
    ">


      {/* BACKGROUND GLOW */}

      <div className="
        absolute
        inset-0
        bg-gradient-to-br
        from-primary/10
        via-transparent
        to-transparent
        opacity-70
      "/>



      <div className="
        relative
        space-y-6
      ">


        {/* HEADER */}

        <div className="
          flex
          items-center
          justify-between
        ">


          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
              text-primary
            ">

              <CreditCard size={22}/>

            </div>


            <div>

              <h2 className="
                font-semibold
              ">
                Payments
              </h2>


              <p className="
                text-xs
                text-muted-foreground
              ">
                Financial overview
              </p>

            </div>

          </div>

        </div>







        {/* MAIN REVENUE */}

        <div className="
          rounded-2xl
          border
          bg-background/40
          p-4
        ">

          <p className="
            text-sm
            text-muted-foreground
          ">
            Total Revenue
          </p>


          <div className="
            mt-1
            flex
            items-center
            gap-2
          ">

            <p className="
              text-2xl
              font-bold
            ">
              {money(summary.totalRevenue)}
            </p>


            <TrendingUp
              size={18}
              className="text-green-500"
            />

          </div>


        </div>







        {/* STATS */}

        <div className="
          grid
          grid-cols-2
          gap-4
        ">


          <Stat
            label="Subscriptions"
            value={
              money(
                summary.subscriptionRevenue
              )
            }
          />


          <Stat
            label="Predictions"
            value={
              money(
                summary.predictionRevenue
              )
            }
          />


          <Stat
            label="Payments"
            value={
              summary.totalPayments
            }
          />


          <Stat
            label="Approval"
            value={
              `${approvalRate}%`
            }
          />


        </div>








        {/* PAYMENT STATUS */}

        <div className="
          grid
          grid-cols-3
          gap-3
        ">


          <Status
            icon={
              <CheckCircle size={14}/>
            }
            label="Approved"
            value={
              summary.approvedPayments
            }
            className="
              text-green-500
              bg-green-500/10
            "
          />



          <Status
            icon={
              <Clock size={14}/>
            }
            label="Pending"
            value={
              summary.pendingPayments
            }
            className="
              text-yellow-500
              bg-yellow-500/10
            "
          />



          <Status
            icon={
              <XCircle size={14}/>
            }
            label="Rejected"
            value={
              summary.rejectedPayments
            }
            className="
              text-red-500
              bg-red-500/10
            "
          />


        </div>



      </div>


    </div>

  );
}






function Stat({
  label,
  value,
}:{
  label:string;
  value:string|number;
}){

  return (

    <div className="
      rounded-xl
      border
      bg-background/30
      p-3
    ">

      <p className="
        text-xs
        text-muted-foreground
      ">
        {label}
      </p>


      <p className="
        mt-1
        text-sm
        font-semibold
      ">
        {value}
      </p>

    </div>

  );

}






function Status({
  icon,
  label,
  value,
  className,
}:{
  icon:React.ReactNode;
  label:string;
  value:number;
  className:string;
}){


  return (

    <div className={`
      rounded-xl
      p-3
      ${className}
    `}>


      <div className="
        flex
        items-center
        gap-2
        text-xs
      ">

        {icon}

        {label}

      </div>


      <p className="
        mt-2
        text-lg
        font-bold
      ">
        {value}
      </p>


    </div>

  );

}