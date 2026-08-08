import {
  Radio,
} from 'lucide-react';
import Image from 'next/image';

import type {
  Match,
} from '@/services/sports.service';





interface Props {

  matches:Match[];

}






export default function LiveMatches({
  matches,
}:Props){



  if(!matches.length){

    return null;

  }







  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/60
        p-6
        shadow-xl
        backdrop-blur-xl
      "
    >



      {/* GLOW */}

      <div
        className="
          absolute
          -right-20
          -top-20
          h-52
          w-52
          rounded-full
          bg-red-500/10
          blur-3xl
        "
      />







      <div
        className="
          relative
          mb-6
          flex
          items-center
          justify-between
        "
      >



        <div
          className="
            flex
            items-center
            gap-3
          "
        >


          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-red-500/10
              text-red-500
            "
          >

            <Radio
              size={22}
            />

          </div>




          <div>

            <h2
              className="
                font-bold
              "
            >
              Live Now
            </h2>


            <p
              className="
                text-xs
                text-muted-foreground
              "
            >
              Matches currently in play
            </p>

          </div>



        </div>





        <span
          className="
            rounded-full
            bg-red-500/10
            px-3
            py-1
            text-xs
            font-semibold
            text-red-500
          "
        >

          {matches.length} Live

        </span>



      </div>










      <div
        className="
          relative
          space-y-4
        "
      >


        {
          matches.map(
            match => (


              <div

                key={match.id}

                className="
                  rounded-2xl
                  border
                  border-border
                  bg-background/40
                  p-5
                  transition
                  hover:bg-muted/40
                "

              >




                <div
                  className="
                    grid
                    grid-cols-1
                    gap-5
                    sm:grid-cols-[1fr_auto_1fr]
                    sm:items-center
                  "
                >







                  {/* HOME TEAM */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >


                    {
                      match.homeTeamBadge && (

                        <Image

                          src={match.homeTeamBadge}

                          alt={match.homeTeam}
                            width={40}

                            height={40}
                          className="
                            h-10
                            w-10
                            object-contain
                          "

                        />

                      )
                    }



                    <span
                      className="
                        font-semibold
                      "
                    >

                      {match.homeTeam}

                    </span>



                  </div>









                  {/* SCORE */}

                  <div
                    className="
                      text-center
                    "
                  >


                    <div
                      className="
                        text-2xl
                        font-black
                      "
                    >

                      {match.homeScore ?? 0}

                      <span
                        className="
                          mx-2
                          text-muted-foreground
                        "
                      >
                        -
                      </span>

                      {match.awayScore ?? 0}


                    </div>




                    <div
                      className="
                        mt-1
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-red-500/10
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-red-500
                      "
                    >

                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-red-500
                        "
                      />

                      LIVE

                    </div>



                  </div>










                  {/* AWAY TEAM */}

                  <div
                    className="
                      flex
                      items-center
                      justify-end
                      gap-3
                    "
                  >


                    <span
                      className="
                        font-semibold
                        text-right
                      "
                    >

                      {match.awayTeam}

                    </span>




                    {
                      match.awayTeamBadge && (

                        <Image

                          src={match.awayTeamBadge}

                          alt={match.awayTeam}
                          width={40}

                          height={40}
                          className="
                            h-10
                            w-10
                            object-contain
                          "

                        />

                      )
                    }




                  </div>





                </div>






                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-xs
                    text-muted-foreground
                  "
                >

                  {match.league?.name}

                </div>





              </div>


            )
          )
        }



      </div>




    </section>

  );

}