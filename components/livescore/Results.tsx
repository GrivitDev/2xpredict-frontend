'use client';

import {
  useState,
} from 'react';


import Image from 'next/image';


import {
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';



import type {
  Match,
} from '@/services/sports.service';



interface Props {

  results: Match[];

}





export default function Results({
  results,
}:Props){



  const [expanded,setExpanded] = useState(false);



  const visibleResults = expanded
    ? results
    : results.slice(0,8);





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



      <div
        className="
          absolute
          -left-20
          -bottom-20
          h-56
          w-56
          rounded-full
          bg-yellow-500/10
          blur-3xl
        "
      />







      {/* HEADER */}

      <div
        className="
          relative
          mb-6
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
            bg-yellow-500/10
            text-yellow-500
          "
        >

          <Trophy size={22}/>

        </div>



        <div>

          <h2
            className="
              font-bold
            "
          >
            Recent Results
          </h2>


          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            Completed matches
          </p>


        </div>


      </div>









      {
        results.length === 0

        ?

        (

          <div
            className="
              rounded-2xl
              border
              border-border
              bg-background/40
              p-6
              text-center
              text-sm
              text-muted-foreground
            "
          >

            No completed matches

          </div>

        )


        :


        (

          <>


          <div
            className="
              relative
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >


            {
              visibleResults.map(
                match=>(


                  <div
                    key={match.id}

                    className="
                      rounded-2xl
                      border
                      border-border
                      bg-background/40
                      p-4
                      transition
                      hover:-translate-y-1
                      hover:bg-muted/40
                    "
                  >






                    {/* DATE */}

                    <div
                      className="
                        mb-3
                        text-center
                        text-xs
                        text-muted-foreground
                      "
                    >

                      {
                        new Date(
                          match.date,
                        )
                        .toLocaleDateString(
                          'en-NG',
                          {
                            day:'numeric',
                            month:'short',
                            year:'numeric',
                          }
                        )
                      }

                    </div>







                    {/* TEAMS */}


                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >



                      {/* HOME */}

                      <div
                        className="
                          flex
                          flex-1
                          flex-col
                          items-center
                          gap-2
                        "
                      >


                        {
                          match.homeTeamBadge &&

                          <Image

                            src={
                              match.homeTeamBadge
                            }

                            alt={
                              match.homeTeam
                            }

                            width={38}

                            height={38}

                            className="
                              h-9
                              w-9
                              object-contain
                            "

                          />

                        }


                        <span
                          className="
                            text-center
                            text-xs
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
                            text-xl
                            font-black
                          "
                        >

                          {match.homeScore ?? 0}

                          <span
                            className="
                              mx-1
                              text-muted-foreground
                            "
                          >
                            -
                          </span>

                          {match.awayScore ?? 0}


                        </div>


                        <span
                          className="
                            mt-1
                            inline-flex
                            rounded-full
                            bg-yellow-500/10
                            px-2
                            py-1
                            text-[10px]
                            font-bold
                            text-yellow-500
                          "
                        >

                          FT

                        </span>


                      </div>








                      {/* AWAY */}

                      <div
                        className="
                          flex
                          flex-1
                          flex-col
                          items-center
                          gap-2
                        "
                      >


                        {
                          match.awayTeamBadge &&

                          <Image

                            src={
                              match.awayTeamBadge
                            }

                            alt={
                              match.awayTeam
                            }

                            width={38}

                            height={38}

                            className="
                              h-9
                              w-9
                              object-contain
                            "

                          />

                        }


                        <span
                          className="
                            text-center
                            text-xs
                            font-semibold
                          "
                        >

                          {match.awayTeam}

                        </span>


                      </div>




                    </div>






                  </div>


                )
              )
            }


          </div>






          {
            results.length > 8 && (

              <button

                onClick={()=>
                  setExpanded(
                    !expanded
                  )
                }

                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-border
                  bg-background/40
                  py-3
                  text-sm
                  font-semibold
                  transition
                  hover:bg-muted/40
                "
              >

                {
                  expanded

                  ?

                  <>
                    Show Less
                    <ChevronUp size={16}/>
                  </>

                  :

                  <>
                    Show All Results
                    <ChevronDown size={16}/>
                  </>
                }


              </button>

            )
          }



          </>

        )

      }



    </section>

  );

}