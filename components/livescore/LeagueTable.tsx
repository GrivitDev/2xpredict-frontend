import Image from 'next/image';

import {
  Trophy,
} from 'lucide-react';





interface Standing {
  
  teamId?:number;

  position:number;

  team:string;

  crest?:string;

  playedGames:number;

  won:number;

  draw:number;

  lost:number;

  goalsFor:number;

  goalsAgainst:number;

  goalDifference:number;

  points:number;

}





interface Props {

  table:Standing[];

}







export default function LeagueTable({
  table,
}:Props){



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
          bottom-0
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

          <Trophy
            size={22}
          />

        </div>





        <div>

          <h2
            className="
              font-bold
            "
          >
            League Table
          </h2>


          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            Current standings
          </p>


        </div>



      </div>









      {
        table.length === 0

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

            No standings available

          </div>

        )


        :


        (

          <div
            className="
              relative
              overflow-x-auto
            "
          >


            <table
              className="
                w-full
                min-w-[480px]
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
                      px-3
                      py-3
                      text-left
                    "
                  >
                    #
                  </th>


                  <th
                    className="
                      px-4
                      py-4
                      text-left
                    "
                  >
                    Team
                  </th>


                  <th
                    className="
                      px-2
                      py-2
                    "
                  >
                    P
                  </th>


                  <th
                    className="
                      px-2
                      py-2
                    "
                  >
                    W
                  </th>


                  <th
                    className="
                      px-2
                      py-2
                    "
                  >
                    D
                  </th>


                  <th
                    className="
                      px-2
                      py-2
                    "
                  >
                    L
                  </th>


                  <th
                    className="
                      px-2
                      py-2
                    "
                  >
                    GD
                  </th>


                  <th
                    className="
                      px-2
                      py-2
                    "
                  >
                    PTS
                  </th>


                </tr>


              </thead>








              <tbody>


                {
                  table.map(
                    (team, index)=>(


                        <tr

                          key={
                            team.teamId ?? `${team.team}-${team.position}`
                          }
                        className={`
                          border-b
                          border-border/50
                          transition
                          hover:bg-muted/40
                                                      ${
                            index % 2 === 0
                            ? 'bg-background/60'
                            : 'bg-muted/20'
                            }
                        `}

                      >



                        {/* POSITION */}

                        <td
                          className="
                            px-3
                            py-3
                            font-bold
                          "
                        >

                          {team.position}

                        </td>









                        {/* TEAM */}

                        <td
                          className="
                            px-4
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
                              team.crest && (

                                <Image

                                  src={
                                    team.crest
                                  }

                                  alt={
                                    team.team
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



                            <span
                              className="
                                font-semibold
                              "
                            >

                              {team.team}

                            </span>



                          </div>


                        </td>










                        <td
                          className="
                            text-center
                            px-2
                            py-2
                          "
                        >

                          {team.playedGames}

                        </td>




                        <td
                          className="
                            text-center
                             px-2
                            py-2
                          "
                        >

                          {team.won}

                        </td>




                        <td
                          className="
                            text-center
                             px-2
                            py-2
                          "
                        >

                          {team.draw}

                        </td>





                        <td
                          className="
                            text-center
                             px-2
                            py-2
                          "
                        >

                          {team.lost}

                        </td>





                        <td
                          className="
                            text-center
                             px-2
                            py-2
                          "
                        >

                          {team.goalDifference}

                        </td>





                        <td
                          className="
                            text-center
                            font-black
                             px-2
                            py-2
                          "
                        >

                          {team.points}

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





    </section>

  );

}