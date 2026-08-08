'use client';

import {
  Lock,
  Crown,
  ShoppingCart,
  Sparkles,
  Target,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
} from 'lucide-react';



interface LockedCardProps {

  loading:boolean;

  price:number;

  message?:string;

  actions?:string[];

  onUpgrade:()=>void;

  onBuy:()=>void;

}




export default function LockedCard({

  loading,

  price,

  message,

  actions = [],

  onUpgrade,

  onBuy,

}:LockedCardProps){



  const canUpgrade =
    actions.includes('upgrade_vip') ||
    actions.includes('subscribe_vip') ||
    actions.includes('subscribe_regular');



  const canBuy =
    actions.includes('buy_prediction');





  return (

    <div

      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-yellow-500/30
        bg-gradient-to-br
        from-yellow-500/10
        via-card
        to-card
        p-6
        space-y-6
      "

    >



      {/* GLOW */}


      <div

        className="
          absolute
          right-0
          top-0
          h-40
          w-40
          rounded-full
          bg-yellow-500/20
          blur-3xl
        "

      />







      {/* HEADER */}



      <div

        className="
          relative
          flex
          items-start
          gap-4
        "

      >


        <div

          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-yellow-500/20
            text-yellow-400
          "

        >

          <Lock size={26}/>


        </div>




        <div
          className="
            space-y-1
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <h3
              className="
                text-xl
                font-bold
              "
            >

              Prediction Locked

            </h3>


            <Sparkles

              size={16}

              className="
                text-yellow-400
              "

            />

          </div>




          <p

            className="
              text-sm
              text-muted-foreground
            "

          >

            {
              message ??
              'Unlock the complete AI prediction analysis'
            }

          </p>


        </div>


      </div>









      {/* BENEFITS */}



      <div

        className="
          grid
          gap-3
        "

      >



        <Feature

          icon={
            <Target size={18}/>
          }

          title="Full Prediction"

          description="AI recommended outcome"

        />



        <Feature

          icon={
            <ChartNoAxesColumnIncreasing size={18}/>
          }

          title="Probability Analysis"

          description="Detailed confidence breakdown"

        />



        <Feature

          icon={
            <ShieldCheck size={18}/>
          }

          title="Premium Markets"

          description="Access available betting markets"

        />



      </div>









      {/* PRICE */}



      {
        canBuy && (

          <div

            className="
              rounded-2xl
              border
              border-yellow-500/20
              bg-yellow-500/5
              p-4
              text-center
            "

          >

            <p

              className="
                text-xs
                uppercase
                tracking-wider
                text-muted-foreground
              "

            >

              One-time access

            </p>



            <p

              className="
                mt-1
                text-3xl
                font-black
                text-yellow-400
              "

            >

              ₦{price.toLocaleString('en-GB')}

            </p>



          </div>

        )
      }









      {/* ACTIONS */}



      {
        (canUpgrade || canBuy) && (

          <div

            className="
              grid
              gap-3
              sm:grid-cols-2
            "

          >



            {
              canUpgrade && (

                <button

                  onClick={onUpgrade}

                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-border
                    px-5
                    py-3
                    font-semibold
                    transition
                    hover:bg-muted
                  "

                >

                  <Crown size={18}/>

                  Upgrade Plan


                </button>

              )
            }





            {
              canBuy && (

                <button

                  disabled={loading}

                  onClick={onBuy}

                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-yellow-500
                    px-5
                    py-3
                    font-bold
                    text-black
                    transition
                    hover:bg-yellow-400
                    disabled:opacity-50
                  "

                >

                  <ShoppingCart size={18}/>


                  {
                    loading

                    ?

                    'Processing...'

                    :

                    'Unlock Prediction'

                  }


                </button>

              )
            }



          </div>

        )
      }



    </div>

  );

}








function Feature({

  icon,

  title,

  description,

}:{

  icon:React.ReactNode;

  title:string;

  description:string;

}){


  return (

    <div

      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-border
        bg-background/50
        p-4
      "

    >

      <div

        className="
          rounded-xl
          bg-yellow-500/10
          p-2
          text-yellow-400
        "

      >

        {icon}

      </div>



      <div>

        <p

          className="
            text-sm
            font-semibold
          "

        >

          {title}

        </p>



        <p

          className="
            text-xs
            text-muted-foreground
          "

        >

          {description}

        </p>


      </div>



    </div>

  );

}