'use client';

import Image from 'next/image';

import {
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

import {
  DashboardCard,
} from '@/components/dashboard/shared/DashboardCard';

import {
  formatMatchTime,
} from '@/lib/formatMatchTime';

import type {
  PredictionItem,
} from './dashboard.types';



export function TopPredictionsCard({
  items = [],
}: {
  items?: PredictionItem[];
}) {


  if (!items.length) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-dashed
          border-border
          bg-background/40
          p-6
          text-sm
          text-muted-foreground
        "
      >
        No predictions available today.
      </div>
    );
  }



  return (
    <div
      className="
        grid
        gap-5
        sm:grid-cols-2
        xl:grid-cols-3
      "
    >

      {
        items.map((item,index)=>{


          const home =
            item.homeTeam ||
            'Home';



          const away =
            item.awayTeam ||
            'Away';



          return (

            <DashboardCard
              key={
                item._id ||
                `${home}-${away}-${index}`
              }

              className="
                group
                p-0
              "
            >


              <div
                className="
                  relative
                  overflow-hidden
                  p-4
                  sm:p-5
                "
              >


                {/* TOP GLOW */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-24
                    bg-gradient-to-b
                    from-primary/20
                    to-transparent
                  "
                />



                {/* LEAGUE */}

                <div
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  {
                    item.league?.emblem && (

                      <Image
                        src={
                          item.league.emblem
                        }
                        alt={
                          item.league.name ||
                          'League'
                        }
                        width={42}
                        height={42}
                        className="
                          object-contain
                        "
                      />

                    )
                  }



                  <div
                    className="
                      text-center
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                      "
                    >

                      {
                        item.league?.name ||
                        'Football League'
                      }

                    </p>


                    {
                      item.league?.country && (

                        <p
                          className="
                            text-[11px]
                            text-muted-foreground
                          "
                        >
                          {
                            item.league.country
                          }
                        </p>

                      )
                    }

                  </div>

                </div>





                {/* MATCH */}

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >

                  <TeamMini
                    name={home}
                    badge={
                      item.homeTeamBadge
                    }
                  />



                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-border
                      bg-muted
                      text-[11px]
                      font-bold
                      text-muted-foreground
                    "
                  >
                    VS
                  </div>



                  <TeamMini
                    name={away}
                    badge={
                      item.awayTeamBadge
                    }
                  />

                </div>





                {/* INFORMATION */}

                <div
                  className="
                    mt-5
                    space-y-3
                  "
                >

                    <InfoCard
                    icon={
                        <CalendarDays
                        className="
                            h-3.5
                            w-3.5
                        "
                        />
                    }
                    label="Kickoff"
                    value={
                        item.matchDate
                        ? formatMatchTime(item.matchDate)
                        : 'TBA'
                    }
                    />



                  <ConfidenceCard
                    confidence={
                      Number(
                        item.confidence || 0
                      )
                    }
                  />

                </div>


              </div>


            </DashboardCard>

          );

        })
      }

    </div>
  );
}






function TeamMini({
  name,
  badge,
}:{
  name:string;
  badge?:string;
}) {


  return (

    <div
      className="
        flex
        min-w-0
        flex-1
        flex-col
        items-center
        gap-2
      "
    >

      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-border
          bg-background
        "
      >

        {
          badge ? (

            <Image
              src={badge}
              alt={name}
              width={36}
              height={36}
              className="
                object-contain
              "
            />

          ) : (

            <ShieldCheck
              className="
                h-5
                w-5
                text-muted-foreground
              "
            />

          )
        }

      </div>



      <p
        className="
          max-w-[90px]
          truncate
          text-center
          text-xs
          font-semibold
        "
      >
        {name}
      </p>


    </div>

  );
}







function ConfidenceCard({
  confidence,
}:{
  confidence:number;
}) {


  const value =
    Math.min(
      100,
      Math.max(
        0,
        confidence,
      ),
    );



  return (

    <div
      className="
        rounded-2xl
        border
        border-border
        bg-muted/30
        p-3
      "
    >

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-xs
            text-muted-foreground
          "
        >
          Confidence
        </span>


        <span
          className="
            text-xs
            font-bold
            text-emerald-500
          "
        >
          {value}%
        </span>

      </div>



      <div
        className="
          h-2
          overflow-hidden
          rounded-full
          bg-muted
        "
      >

        <div
          className="
            h-full
            rounded-full
            bg-emerald-500
            transition-all
            duration-700
          "
          style={{
            width:`${value}%`,
          }}
        />

      </div>

    </div>

  );
}







function InfoCard({
  icon,
  label,
  value,
}:{
  icon:React.ReactNode;
  label:string;
  value:string;
}) {


  return (

    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-border
        bg-background/60
        p-3
      "
    >

      <div
        className="
          rounded-xl
          bg-primary/10
          p-2
          text-primary
        "
      >
        {icon}
      </div>


      <div>

        <p
          className="
            text-[11px]
            text-muted-foreground
          "
        >
          {label}
        </p>


        <p
          className="
            text-xs
            font-semibold
          "
        >
          {value}
        </p>

      </div>


    </div>

  );
}