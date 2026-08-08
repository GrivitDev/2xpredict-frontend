'use client';

import {
  Crown,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';


type Props = {
  summary: {
    hasSubscription: boolean;
    currentPlan: string;
    status: string;
    daysRemaining: number;
    expired: boolean;
  };
};





export default function SubscriptionSummaryCard({
  summary,
}:Props){


  const isVip =
    summary.currentPlan.toLowerCase() === 'vip';


  const statusColor =
    summary.expired
      ?
      'text-red-500 bg-red-500/10 border-red-500/20'
      :
      'text-green-500 bg-green-500/10 border-green-500/20';



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


      {/* GOLD GLOW */}

      <div className="
        absolute
        inset-0
        bg-gradient-to-br
        from-yellow-500/10
        via-transparent
        to-transparent
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
              bg-yellow-500/10
              text-yellow-500
            ">

              <Crown size={22}/>

            </div>



            <div>

              <h2 className="
                font-semibold
              ">
                Subscription
              </h2>


              <p className="
                text-xs
                text-muted-foreground
              ">
                Membership status
              </p>


            </div>


          </div>





          {
            isVip && (

              <span className="
                rounded-full
                bg-yellow-500/10
                px-3
                py-1
                text-xs
                font-medium
                text-yellow-500
              ">
                VIP
              </span>

            )
          }


        </div>









        {/* PLAN */}

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
            Current Plan
          </p>


          <p className="
            mt-1
            text-2xl
            font-bold
          ">
            {
              summary.currentPlan
                .toUpperCase()
            }
          </p>


        </div>








        {/* DETAILS */}

        <div className="
          grid
          grid-cols-2
          gap-4
        ">


          <Stat

            icon={
              <ShieldCheck size={15}/>
            }

            label="Status"

            value={
              summary.status
            }

          />



          <Stat

            icon={
              <CalendarDays size={15}/>
            }

            label="Days Left"

            value={
              summary.daysRemaining
            }

          />


        </div>







        {/* EXPIRY */}

        <div className={`
          flex
          items-center
          gap-2
          rounded-xl
          border
          px-3
          py-2
          text-xs
          ${statusColor}
        `}>


          {
            summary.expired
            ?

            <>

              <AlertTriangle size={15}/>

              Subscription expired

            </>


            :

            <>

              <ShieldCheck size={15}/>

              Subscription active

            </>
          }


        </div>





      </div>



    </div>

  );

}







function Stat({
  icon,
  label,
  value,
}:{
  icon:React.ReactNode;
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


      <div className="
        flex
        items-center
        gap-2
        text-xs
        text-muted-foreground
      ">

        {icon}

        {label}

      </div>



      <p className="
        mt-2
        text-sm
        font-semibold
      ">
        {value}
      </p>


    </div>

  );

}