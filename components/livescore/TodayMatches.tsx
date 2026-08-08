'use client';


import {
  useState,
  useMemo,
} from 'react';


import Image from 'next/image';


import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';



import type {
  Match,
} from '@/services/sports.service';




interface Props {

  matches: Match[];

}






export default function TodayMatches({
  matches,
}: Props){



  const [
    expanded,
    setExpanded,
  ] = useState(false);



const todayMatches = useMemo(() => {

  const today = new Date();

  const todayString = today.toLocaleDateString(
    'en-CA',
    {
      timeZone:'Africa/Lagos',
    },
  );

  return matches.filter(match => {

    const matchDate = new Date(match.date);

    return (
      matchDate.toLocaleDateString(
        'en-CA',
        {
          timeZone:'Africa/Lagos',
        },
      ) === todayString
    );

  });

}, [matches]);


const visibleMatches =
expanded
?
todayMatches
:
todayMatches.slice(0,10);






const formattedDate = new Intl.DateTimeFormat(
  'en-GB',
  {
    weekday:'long',
    day:'2-digit',
    month:'short',
    year:'numeric',
  },
).format(new Date());








  return (

    <section
      className="
        overflow-hidden
        rounded-3xl
        bg-card/30
      "
    >



      {/* HEADER */}

      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-border
          p-6
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
            bg-blue-500/10
            text-blue-500
          "
        >

          <CalendarDays size={22}/>

        </div>



        <div>

          <h2
            className="
              font-bold
            "
          >

            Matches for Today

          </h2>


          <p
            className="
              text-xs
              text-muted-foreground
            "
          >

            {formattedDate}

          </p>


        </div>


      </div>










      {
        todayMatches.length === 0

        ?

        (

            <div
            className="
                p-10
                text-center
            "
            >

            <h3
                className="
                text-lg
                font-semibold
                "
            >
                No matches today
            </h3>

            <p
                className="
                mt-2
                text-sm
                text-muted-foreground
                "
            >
                There are no fixtures scheduled for today in this league.
            </p>

            </div>

        )


        :


        (

          <>

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                text-sm
              "
            >



              <thead>

                <tr
                  className="
                    border-b
                    border-border
                    text-left
                    text-xs
                    uppercase
                    text-muted-foreground
                  "
                >

                  <th
                    className="
                      px-6
                      py-4
                    "
                  >
                    Time
                  </th>



                  <th>
                    Home
                  </th>



                  <th>
                    Away
                  </th>



                  <th>
                    Venue
                  </th>



                </tr>


              </thead>





              <tbody>


              {
                visibleMatches.map(
                  match=>(


                    <tr

                      key={match.id}

                      className="
                        border-b
                        border-border/50
                        transition
                        hover:bg-muted/40
                      "

                    >



                      {/* TIME */}

                      <td
                        className="
                          px-6
                          py-5
                          font-bold
                          whitespace-nowrap
                        "
                      >

                        {
                            new Date(match.date).toLocaleTimeString(
                                'en-NG',
                                {
                                timeZone:'Africa/Lagos',
                                hour:'2-digit',
                                minute:'2-digit',
                                hour12:false,
                                },
                            )
                            }
                      </td>








                      {/* HOME */}

                      <td>


                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            font-semibold
                          "
                        >


                          {
                            match.homeTeamBadge && (

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

                            )
                          }



                          {match.homeTeam}


                        </div>


                      </td>









                      {/* AWAY */}

                      <td>


                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            font-semibold
                          "
                        >


                          {
                            match.awayTeamBadge && (

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

                            )
                          }



                          {match.awayTeam}


                        </div>


                      </td>










                      {/* VENUE */}

                      <td
                        className="
                          text-muted-foreground
                        "
                      >

                        {
                          match.venue
                          ??
                          'Not available'
                        }

                      </td>






                    </tr>


                  )
                )

              }


              </tbody>


            </table>


          </div>






          {
            matches.length > 7 && (


              <button

                onClick={()=>
                  setExpanded(
                    !expanded
                  )
                }

                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  border-t
                  border-border
                  py-4
                  text-sm
                  font-semibold
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
                      Show All Matches ({todayMatches.length})
                      <ChevronDown size={16}/>
                    </>

                  )
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