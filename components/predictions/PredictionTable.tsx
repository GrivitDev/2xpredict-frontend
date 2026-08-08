'use client';

import { formatMatchTime } from '@/lib/formatMatchTime';

import ConfidenceBadge from './ConfidenceBadge';
import AccessBadge from './AccessBadge';



interface Props {

  predictions:any[];

  onSelect:(prediction:any)=>void;

}



export default function PredictionTable({

  predictions,

  onSelect,

}:Props){



  return (

    <div

      className="
        hidden
        lg:block
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/70
        backdrop-blur-xl
      "

    >


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



          <thead

            className="
              border-b
              border-border
              bg-muted/30
            "

          >

            <tr>


              <th
                className="
                  p-5
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >

                League

              </th>



              <th
                className="
                  p-5
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >

                Match

              </th>



              <th
                className="
                  p-5
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >

                Date

              </th>



              <th
                className="
                  p-5
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >

                Confidence

              </th>




              <th
                className="
                  p-5
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >

                Access

              </th>



            </tr>


          </thead>







          <tbody>


            {
              predictions.map((prediction)=>(


                <tr


                  key={
                    prediction._id ??
                    prediction.id
                  }


                  onClick={()=>
                    onSelect(prediction)
                  }


                  className="
                    group
                    cursor-pointer
                    border-b
                    border-border
                    transition
                    hover:bg-muted/40
                  "


                >







                  {/* LEAGUE */}


                  <td
                    className="
                      p-5
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
                        prediction.league?.emblem && (

                          <img

                            src={
                              prediction.league.emblem
                            }

                            alt=""
                            
                            className="
                              h-10
                              w-10
                              rounded-xl
                              bg-muted
                              p-1
                              object-contain
                            "

                          />

                        )
                      }




                      <div>


                        <p
                          className="
                            font-semibold
                          "
                        >

                          {
                            prediction.league?.name ??
                            prediction.leagueCode
                          }

                        </p>



                        <p
                          className="
                            text-xs
                            text-muted-foreground
                          "
                        >

                          {
                            prediction.league?.country
                          }

                        </p>


                      </div>


                    </div>


                  </td>









                  {/* MATCH */}


                  <td
                    className="
                      p-5
                    "
                  >


                    <div
                      className="
                        space-y-3
                      "
                    >



                      <TeamRow

                        badge={
                          prediction.homeTeamBadge
                        }

                        name={
                          prediction.homeTeam
                        }

                      />



                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className="
                            h-px
                            flex-1
                            bg-border
                          "
                        />


                        <span
                          className="
                            text-xs
                            font-bold
                            text-muted-foreground
                          "
                        >

                          VS

                        </span>


                        <div
                          className="
                            h-px
                            flex-1
                            bg-border
                          "
                        />

                      </div>





                      <TeamRow

                        badge={
                          prediction.awayTeamBadge
                        }

                        name={
                          prediction.awayTeam
                        }

                      />




                    </div>


                  </td>









                  {/* DATE */}



                  <td
                    className="
                      p-5
                      text-muted-foreground
                    "
                  >

                    {
                      formatMatchTime(
                        prediction.matchDate
                      )
                    }

                  </td>









                  {/* CONFIDENCE */}



                  <td
                    className="
                      p-5
                      min-w-[180px]
                    "
                  >

                    <ConfidenceBadge

                      confidence={
                        prediction.confidence
                      }

                    />

                  </td>









                  {/* ACCESS */}



                  <td
                    className="
                      p-5
                    "
                  >

                    <AccessBadge

                      accessType={
                        prediction.accessType
                      }

                    />


                  </td>




                </tr>


              ))
            }



          </tbody>



        </table>


      </div>


    </div>

  );

}







function TeamRow({

  badge,

  name,

}:{

  badge?:string;

  name:string;

}){


  return (

    <div

      className="
        flex
        items-center
        gap-3
      "

    >


      {
        badge && (

          <img

            src={badge}

            alt={name}

            className="
              h-7
              w-7
              object-contain
            "

          />

        )
      }



      <span
        className="
          font-medium
        "
      >

        {name}

      </span>


    </div>

  );

}