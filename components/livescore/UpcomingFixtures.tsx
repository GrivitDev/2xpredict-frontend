'use client';

import {
  useState,
} from 'react';

import Image from 'next/image';

import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';


import type {
  Match,
} from '@/services/sports.service';



interface Props {

  fixtures: Match[];

}



export default function UpcomingFixtures({
  fixtures,
}:Props){


  const [expanded,setExpanded] = useState(false);



  const visibleFixtures = expanded
    ? fixtures
    : fixtures.slice(0,10);



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
          -right-20
          -top-20
          h-56
          w-56
          rounded-full
          bg-green-500/10
          blur-3xl
        "
      />



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
            bg-green-500/10
            text-green-500
          "
        >

          <CalendarClock size={22}/>

        </div>



        <div>

          <h2
            className="
              font-bold
            "
          >
            Upcoming Fixtures
          </h2>


          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            Scheduled matches
          </p>


        </div>


      </div>






      {
        fixtures.length === 0

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

            No upcoming fixtures

          </div>

        )


        :

        (

          <div
            className="
              overflow-x-auto
              rounded-2xl
              border
              border-border
            "
          >

            <table
              className="
                w-full
                min-w-[700px]
                text-sm
              "
            >


              <thead>

                <tr
                  className="
                    border-b
                    border-border
                    text-xs
                    uppercase
                    text-muted-foreground
                  "
                >


                  <th
                    className="
                      bg-background/40
                      px-5
                      py-4
                      text-left
                    "
                  >
                    Date
                  </th>



                  <th
                    className="
                      bg-muted/30
                      px-5
                      py-4
                      text-left
                    "
                  >
                    Time
                  </th>



                  <th
                    className="
                      bg-background/40
                      px-5
                      py-4
                      text-left
                    "
                  >
                    Home
                  </th>



                  <th
                    className="
                      bg-muted/30
                      px-5
                      py-4
                      text-left
                    "
                  >
                    Away
                  </th>



                </tr>

              </thead>





              <tbody>


              {
                visibleFixtures.map(
                  (match, index)=>(


                    <tr
                      key={match.id}
                        className={`
                            border-b
                            border-border/50
                            transition
                            hover:bg-primary/5
                            ${
                            index % 2 === 0
                            ? 'bg-background/60'
                            : 'bg-muted/20'
                            }
                        `}
                        >



                      {/* DATE */}

                      <td
                        className="
                          bg-background/40
                          px-5
                          py-4
                          font-medium
                        "
                      >

                        {
                          new Date(
                            match.date
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

                      </td>





                      {/* TIME */}

                      <td
                        className="
                          bg-muted/30
                          px-5
                          py-4
                          font-semibold
                        "
                      >

                        {match.time}

                      </td>







                      {/* HOME */}

                      <td
                        className="
                          bg-background/40
                          px-5
                          py-4
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-3
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

                              width={32}

                              height={32}

                              className="
                                h-8
                                w-8
                                object-contain
                              "

                            />

                          }


                          <span
                            className="
                              font-semibold
                            "
                          >
                            {match.homeTeam}
                          </span>


                        </div>


                      </td>








                      {/* AWAY */}

                      <td
                        className="
                          bg-muted/30
                          px-5
                          py-4
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-3
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

                              width={32}

                              height={32}

                              className="
                                h-8
                                w-8
                                object-contain
                              "

                            />

                          }


                          <span
                            className="
                              font-semibold
                            "
                          >
                            {match.awayTeam}
                          </span>


                        </div>


                      </td>




                    </tr>


                  )
                )
              }


              </tbody>


            </table>


          </div>

        )

      }





      {
        fixtures.length > 10 && (

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
              (
                <>
                  Show Less
                  <ChevronUp size={16}/>
                </>
              )

              :

              (
                <>
                  Show All Fixtures
                  <ChevronDown size={16}/>
                </>
              )
            }


          </button>

        )
      }



    </section>

  );

}