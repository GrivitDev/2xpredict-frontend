'use client';

import Image from 'next/image';

import {
  CalendarDays,
  Activity,
} from 'lucide-react';

import { formatMatchTime } from '@/lib/formatMatchTime';



interface MatchHeaderProps {

  homeTeam:string;

  awayTeam:string;

  homeTeamBadge?:string;

  awayTeamBadge?:string;

  league?:{
    code:string;
    name:string;
    country:string;
    emblem?:string;
  };

  confidence:number;

  matchDate:string;

  status:string;

}




export default function MatchHeader({

  homeTeam,

  awayTeam,

  homeTeamBadge,

  awayTeamBadge,

  league,

  confidence,

  matchDate,

  status,

}:MatchHeaderProps){



  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card
        p-5
        sm:p-6
        space-y-6
      "
    >


      {/* BACKGROUND GLOW */}


      <div
        className="
          absolute
          inset-x-0
          top-0
          h-32
          bg-gradient-to-b
          from-primary/20
          to-transparent
          pointer-events-none
        "
      />





      {/* LEAGUE */}

{
  league && (

    <div
      className="
        relative
        flex
        flex-col
        items-center
        gap-2
        text-center
      "
    >

      {
        league.emblem && (

          <div
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              -m-3
            "
          >

            <Image

              src={league.emblem}

              alt={league.name}

              width={100}

              height={100}

              className="
                object-contain
              "

            />

          </div>

        )
      }



      <p
        className="
          font-semibold
        "
      >

        {league.name}

        <span
          className="
            text-muted-foreground
            font-normal
          "
        >

          {" "}({league.country})

        </span>

      </p>


    </div>

  )
}








      {/* TEAMS */}



      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-4
        "
      >



        <Team

          name={homeTeam}

          badge={homeTeamBadge}

        />





        <div
          className="
            flex
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
              rounded-full
              bg-muted
              font-bold
              text-muted-foreground
            "
          >

            VS

          </div>


          <span
            className="
              text-xs
              text-muted-foreground
            "
          >

            {status}

          </span>


        </div>






        <Team

          name={awayTeam}

          badge={awayTeamBadge}

        />



      </div>









      {/* DETAILS */}



      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-3
          -mt-3
        "
      >


        <InfoCard

          icon={
            <CalendarDays size={16}/>
          }

          label="Kickoff"

          value={
            formatMatchTime(matchDate)
          }

        />



        <InfoCard

          icon={
            <Activity size={16}/>
          }

          label="Match Status"

          value={
            status
          }

        />


      </div>









      {/* CONFIDENCE */}



      <div
        className="
          space-y-2
          -mt-3
          -mb-3
        "
      >


        <div
          className="
            flex
            justify-between
            text-xs
          "
        >

          <span
            className="
              text-muted-foreground
            "
          >

            Prediction Confidence

          </span>


          <span
            className="
              font-bold
              text-emerald-400
            "
          >

            {confidence}%

          </span>


        </div>





        <div
          className="
            h-3
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
            "

            style={{
              width:`${confidence}%`
            }}

          />


        </div>


      </div>





    </div>

  );

}









function Team({

  name,

  badge,

}:{

  name:string;

  badge?:string;

}){


  return (

    <div
      className="
        flex-1
        flex
        flex-col
        items-center
        gap-3
        min-w-0
      "
    >


      {
        badge && (

          <div
            className="
              flex
              h-18
              w-18
              items-center
              justify-center
              -m-5
            "
          >

            <Image

              src={badge}

              alt={name}

              width={80}

              height={80}

              className="
                object-contain
              "

            />

          </div>

        )
      }




      <p
        className="
          text-center
          font-bold
          truncate
          max-w-[120px]
        "
      >

        {name}

      </p>



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

}){


  return (

    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-border
        bg-muted/30
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
            text-xs
            text-muted-foreground
          "
        >

          {label}

        </p>


        <p
          className="
            text-sm
            font-semibold
          "
        >

          {value}

        </p>


      </div>


    </div>

  );

}