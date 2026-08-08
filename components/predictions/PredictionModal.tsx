'use client';


import { motion } from 'framer-motion';

import { X } from 'lucide-react';

import { usePrediction } from '@/hooks/usePrediction';

import MatchHeader from './MatchHeader';

import CountdownCard from './CountdownCard';

import LockedCard from './LockedCard';

import PredictionContent from './PredictionContent';




interface Props {

  prediction:{
    _id:string;
  };

  onClose:()=>void;

}




export default function PredictionModal({

  prediction,

  onClose,

}:Props){



  const {

    access,

    loading,

    buying,

    countdown,

    buyPrediction,

    upgradePlan,

  } = usePrediction(
    prediction._id
  );







  if(
    loading ||
    !access
  ){

    return (

      <div

        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-background/80
          backdrop-blur-xl
        "

      >


        <div

          className="
            rounded-3xl
            border
            bg-card
            px-8
            py-6
            shadow-2xl
          "

        >

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >

            Loading prediction...

          </p>


        </div>


      </div>

    );

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
        bg-background/80
        backdrop-blur-xl
        p-3
        sm:p-6
      "

      onClick={onClose}

    >



      <motion.div

        initial={{
          opacity:0,
          scale:.96,
          y:20,
        }}

        animate={{
          opacity:1,
          scale:1,
          y:0,
        }}

        transition={{
          duration:.25,
        }}


        onClick={(e)=>
          e.stopPropagation()
        }


        className="
          relative
          w-full
          max-w-xl
          max-h-[90vh]
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card/90
          backdrop-blur-2xl
          shadow-2xl
        "

      >





        {/* TOP GLOW */}


        <div

          className="
            absolute
            inset-x-0
            top-0
            h-32
            bg-gradient-to-b
            from-primary/20
            to-transparent
            pointer-events-none
          "

        />







        {/* CLOSE */}


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
            border-border
            bg-background/70
            backdrop-blur
            transition
            hover:bg-muted
          "

        >

          <X
            size={18}
          />

        </button>








        <div

          className="
            relative
            overflow-y-auto
            max-h-[90vh]
            p-5
            sm:p-7
            space-y-6
            scrollbar-hide
          "

        >








          {/* MATCH HEADER */}



          <MatchHeader

            homeTeam={
              access.homeTeam
            }

            awayTeam={
              access.awayTeam
            }

            homeTeamBadge={
              access.homeTeamBadge
            }

            awayTeamBadge={
              access.awayTeamBadge
            }

            league={
              access.league
            }

            confidence={
              access.confidence
            }

            matchDate={
              access.matchDate
            }

            status={
              access.status
            }


          />









          {
            !access.access.released && (

              <CountdownCard

                days={
                  countdown.days
                }

                hours={
                  countdown.hours
                }

                minutes={
                  countdown.minutes
                }

                seconds={
                  countdown.seconds
                }

              />

            )
          }









          {
            access.access.released &&
            !access.access.allowed && (

              <LockedCard

                loading={
                  buying
                }

                price={
                  access.price
                }

                message={
                  access.access.message ??
                  undefined
                }

                onBuy={
                  buyPrediction
                }

                onUpgrade={
                  upgradePlan
                }

              />

            )
          }









          {
            access.access.allowed && (

                  <PredictionContent

                    prediction={
                      access.data?.prediction
                    }

                    homeTeam={
                      access.homeTeam
                    }

                    awayTeam={
                      access.awayTeam
                    }

                    homeTeamBadge={
                      access.homeTeamBadge
                    }

                    awayTeamBadge={
                      access.awayTeamBadge
                    }

                    probabilities={
                      access.data?.probabilities
                    }

                    markets={
                      access.data?.markets
                    }

                  />

            )
          }






        </div>


      </motion.div>



    </div>

  );

}