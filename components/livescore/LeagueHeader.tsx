'use client';

import Image from 'next/image';

import {
  Trophy,
} from 'lucide-react';

import type {
  League,
} from '@/services/sports.service';



interface Props {

  league:League;

}



export default function LeagueHeader({
  league,
}:Props){


  return (

    <section
        className="
          w-full
          overflow-hidden
        "
      >


        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-4
            px-4
          "
        >


        <div
        className="
        h-20
        w-20
        shrink-0
        "
        >

          {
            league?.emblem ? (

              <Image

                src={league.emblem}

                alt={league.name}

                width={80}

                height={80}

                className="
                  h-full
                  w-full
                  object-contain
                "

              />

            ) : (

              <Trophy

                size={45}

                className="
                  text-primary
                "

              />

            )
          }


        </div>





        {/* NAME */}

        <h1
          className="
            text-2xl
            font-black
            tracking-tight
            text-center
          "
        >

          {league?.name}

        </h1>



      </div>


    </section>

  );

}