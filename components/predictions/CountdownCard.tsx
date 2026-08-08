'use client';

import {
  Lock,
  Clock3,
  Sparkles,
} from 'lucide-react';



interface CountdownCardProps {

  days:number;

  hours:number;

  minutes:number;

  seconds:number;

}





function Box({

  value,

  label,

}:{

  value:number;

  label:string;

}){


  return (

    <div

      className="
        rounded-2xl
        border
        border-yellow-500/20
        bg-background/60
        p-4
        text-center
        backdrop-blur
      "

    >

      <p

        className="
          text-2xl
          sm:text-3xl
          font-black
          text-yellow-400
        "

      >

        {
          String(value)
            .padStart(2,'0')
        }

      </p>



      <p

        className="
          mt-1
          text-[10px]
          uppercase
          tracking-widest
          text-muted-foreground
        "

      >

        {label}

      </p>


    </div>

  );

}







export default function CountdownCard({

  days,

  hours,

  minutes,

  seconds,

}:CountdownCardProps){



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
        p-5
        sm:p-6
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







      <div

        className="
          relative
          space-y-6
        "

      >




        {/* HEADER */}



        <div

          className="
            flex
            flex-col
            items-center
            text-center
            gap-3
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




          <div>


            <div

              className="
                flex
                items-center
                justify-center
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
                mt-2
                text-sm
                text-muted-foreground
              "

            >

              Premium analysis will be revealed soon.

            </p>


          </div>


        </div>









        {/* TIMER */}



        <div

          className="
            grid
            grid-cols-2
            sm:grid-cols-4
            gap-3
          "

        >


          <Box

            value={days}

            label="Days"

          />



          <Box

            value={hours}

            label="Hours"

          />



          <Box

            value={minutes}

            label="Minutes"

          />



          <Box

            value={seconds}

            label="Seconds"

          />



        </div>









        {/* FOOTER */}



        <div

          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-muted/40
            py-3
            text-xs
            text-muted-foreground
          "

        >

          <Clock3 size={14}/>


          Countdown until prediction release


        </div>




      </div>



    </div>

  );

}