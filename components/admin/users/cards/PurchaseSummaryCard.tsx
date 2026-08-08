'use client';

import {
  Trophy,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';


type Props = {
  summary: {
    totalPurchases: number;
    totalSpent: number;
  };
};



const money = (amount:number) =>
  new Intl.NumberFormat('en-NG',{
    style:'currency',
    currency:'NGN',
    maximumFractionDigits:0,
  }).format(amount);





export default function PurchaseSummaryCard({
  summary,
}:Props){


  const averageSpend =
    summary.totalPurchases > 0
      ?
      Math.round(
        summary.totalSpent /
        summary.totalPurchases
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


      {/* GLOW */}

      <div className="
        absolute
        inset-0
        bg-gradient-to-br
        from-green-500/10
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
          gap-3
        ">


          <div className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-green-500/10
            text-green-500
          ">

            <Trophy size={22}/>

          </div>



          <div>

            <h2 className="
              font-semibold
            ">
              Prediction Purchases
            </h2>


            <p className="
              text-xs
              text-muted-foreground
            ">
              User prediction activity
            </p>


          </div>


        </div>







        {/* MAIN STAT */}

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
            Purchased Predictions
          </p>



          <div className="
            mt-2
            flex
            items-center
            gap-2
          ">


            <p className="
              text-3xl
              font-bold
            ">
              {summary.totalPurchases}
            </p>


            <ShoppingBag
              size={20}
              className="
                text-green-500
              "
            />


          </div>


        </div>








        {/* MONEY */}

        <div className="
          grid
          grid-cols-2
          gap-4
        ">


          <Stat

            label="Total Spent"

            value={
              money(
                summary.totalSpent
              )
            }

          />



          <Stat

            label="Average"

            value={
              money(
                averageSpend
              )
            }

          />


        </div>







        {/* FOOTER */}

        <div className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-green-500/10
          px-3
          py-2
          text-xs
          text-green-500
        ">

          <TrendingUp size={15}/>

          Prediction engagement

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