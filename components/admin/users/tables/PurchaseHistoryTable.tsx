'use client';

import {
  Trophy,
  CalendarDays,
  Wallet,
} from 'lucide-react';


type Props = {
  purchases: any[];
};



const money = (amount:number) =>
  new Intl.NumberFormat('en-NG',{
    style:'currency',
    currency:'NGN',
    maximumFractionDigits:0,
  }).format(amount);





export default function PurchaseHistoryTable({
  purchases,
}:Props){



  return (

    <section className="
      overflow-hidden
      rounded-3xl
      border
      bg-card/60
      shadow-xl
      backdrop-blur-xl
    ">


      {/* HEADER */}

      <div className="
        flex
        items-center
        gap-3
        border-b
        border-border
        px-6
        py-5
      ">


        <div className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-green-500/10
          text-green-500
        ">

          <Trophy size={20}/>

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
            Purchased premium predictions
          </p>


        </div>


      </div>








      {
        purchases.length === 0

        ?

        (

          <div className="
            flex
            min-h-[220px]
            flex-col
            items-center
            justify-center
            gap-3
            text-center
          ">


            <Trophy
              size={38}
              className="
                text-muted-foreground
              "
            />


            <p className="
              font-medium
            ">
              No purchases found
            </p>


            <p className="
              text-sm
              text-muted-foreground
            ">
              This user has not purchased any predictions.
            </p>


          </div>

        )


        :

        (

          <div className="
            overflow-x-auto
          ">


            <table className="
              w-full
              text-sm
            ">



              <thead>

                <tr className="
                  border-b
                  border-border
                  text-left
                  text-xs
                  uppercase
                  text-muted-foreground
                ">


                  <th className="
                    px-6
                    py-4
                  ">
                    Date
                  </th>



                  <th>
                    Prediction
                  </th>



                  <th>
                    Amount
                  </th>



                </tr>


              </thead>







              <tbody>


                {
                  purchases.map((purchase)=>(


                    <tr

                      key={purchase._id}

                      className="
                        border-b
                        border-border/50
                        transition
                        hover:bg-muted/40
                      "

                    >





                      {/* DATE */}

                      <td className="
                        px-6
                        py-4
                      ">


                        <div className="
                          flex
                          items-center
                          gap-2
                          text-muted-foreground
                        ">

                          <CalendarDays
                            size={15}
                          />


                          {
                            new Date(
                              purchase.createdAt
                            ).toLocaleDateString()
                          }


                        </div>


                      </td>







                      {/* PREDICTION */}

                      <td>


                        <div className="
                          flex
                          items-center
                          gap-3
                        ">


                          <div className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-500/10
                            text-green-500
                          ">

                            <Trophy size={16}/>

                          </div>



                          <div>

                            <p className="
                              font-medium
                            ">

                              {
                                purchase
                                  .predictionId
                                  ?.title
                                  ??
                                  'Deleted Prediction'
                              }

                            </p>


                            {
                              purchase
                                .predictionId
                                ?.league
                                &&
                                (

                                  <p className="
                                    text-xs
                                    text-muted-foreground
                                  ">

                                    {
                                      purchase
                                      .predictionId
                                      .league
                                    }

                                  </p>

                                )
                            }


                          </div>


                        </div>


                      </td>







                      {/* AMOUNT */}

                      <td>


                        <div className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          bg-green-500/10
                          px-3
                          py-1
                          text-sm
                          font-semibold
                          text-green-500
                        ">


                          <Wallet size={14}/>


                          {
                            money(
                              purchase.amount
                            )
                          }


                        </div>


                      </td>




                    </tr>


                  ))
                }


              </tbody>



            </table>


          </div>

        )
      }



    </section>

  );

}