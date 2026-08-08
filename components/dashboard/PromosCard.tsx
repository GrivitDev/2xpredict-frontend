import {
  Gift,
  Clock,
  Sparkles,
  Wallet,
  Crown,
} from 'lucide-react';

import {
  type PromoItem,
} from './dashboard.types';

import {
  daysLeft,
  fmtDate,
} from './dashboard.utils';



export function PromosCard({
  items = [],
}: {
  items?: PromoItem[];
}) {


  return (

    <div
      className="
        space-y-4
      "
    >

      {
        items
          .slice(0, 3)
          .map((item, index) => {


            const left =
              daysLeft(
                item.endDate,
              );



            const isCash =
              item.rewardType === 'cash';



            return (

              <div
                key={
                  item._id ||
                  `${item.name}-${index}`
                }
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-card
                  p-4
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  sm:p-5
                "
              >


                {/* Glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-primary/10
                    blur-3xl
                  "
                />




                <div
                  className="
                    relative
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >


                  <div
                    className="
                      min-w-0
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
                          truncate
                          text-sm
                          font-bold
                          sm:text-base
                        "
                      >
                        {item.name || 'Promotion'}
                      </h3>


                      <Sparkles
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-primary
                        "
                      />

                    </div>



                    <p
                      className="
                        mt-1
                        line-clamp-2
                        text-sm
                        text-muted-foreground
                      "
                    >
                      {
                        item.description ||
                        'Available promotion'
                      }
                    </p>


                  </div>





                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-primary/20
                      bg-primary/10
                    "
                  >

                    <Gift
                      className="
                        h-5
                        w-5
                        text-primary
                      "
                    />

                  </div>


                </div>





                {/* Reward */}

                <div
                  className="
                    mt-5
                    grid
                    gap-3
                    sm:grid-cols-2
                  "
                >

                  <div
                    className="
                      rounded-2xl
                      border
                      border-border
                      bg-background/60
                      p-3
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-muted-foreground
                      "
                    >

                      {
                        isCash
                        ?
                        <Wallet className="h-4 w-4"/>
                        :
                        <Crown className="h-4 w-4"/>
                      }


                      Reward

                    </div>



                    <p
                      className="
                        mt-1
                        font-bold
                      "
                    >

                      {
                        isCash
                        ?
                        `₦${item.rewardAmount?.toLocaleString('en-GB') || 0}`
                        :
                        item.rewardPlan || 'Subscription'
                      }

                    </p>


                  </div>





                  <div
                    className="
                      rounded-2xl
                      border
                      border-border
                      bg-background/60
                      p-3
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-muted-foreground
                      "
                    >

                      <Clock
                        className="
                          h-4
                          w-4
                        "
                      />

                      Expiry

                    </div>



                    <p
                      className="
                        mt-1
                        font-bold
                      "
                    >

                      {
                        left === null
                        ?
                        fmtDate(item.endDate)
                        :
                        `${left} day${left === 1 ? '' : 's'} left`
                      }

                    </p>


                  </div>


                </div>





              </div>

            );


          })
      }





      {
        !items.length && (

          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-border
              bg-muted/20
              p-6
              text-center
              text-sm
              text-muted-foreground
            "
          >

            No active promos right now.

          </div>

        )
      }


    </div>

  );

}