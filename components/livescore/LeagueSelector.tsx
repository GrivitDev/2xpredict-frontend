'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Trophy
} from 'lucide-react';


import type {
  League,
} from '@/services/sports.service';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';



interface Props {

  leagues:League[];

  selectedLeague:string;

  onSelect:(code:string)=>void;

}



export default function LeagueSelector({

  leagues,

  selectedLeague,

  onSelect,

}:Props){



const countries = useMemo(()=>{

  return Array.from(

    new Set(
      leagues.map(
        league => league.country
      )
    )

  );

},[
  leagues,
]);





  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState('');





const filteredLeagues = useMemo(()=>{

  return leagues.filter(
    league =>
      league.country === selectedCountry
  );

},[
  leagues,
  selectedCountry,
]);




  const activeLeague = useMemo(()=>{


    return leagues.find(

      league =>

        league.code === selectedLeague

    );


  },[
    leagues,
    selectedLeague,
  ]);





  if(!leagues.length){

    return (

      <div
        className="
          rounded-3xl
          border
          border-border
          bg-card
          p-6
          text-sm
          text-muted-foreground
        "
      >

        No leagues available

      </div>

    );

  }

    return (

   <section
  className="
    relative
    overflow-hidden
  "
>


<div
  className="
    absolute
    -right-10
    -top-10
    h-24
    w-24
    sm:-right-110
    sm:-top-10
    sm:h-14
    sm:w-14
  "
/>


  <div
    className="
      relative
    "
  >


    <div
      className="
        grid
        gap-4
        md:grid-cols-2
      "
    >


      {/* COUNTRY */}

      <div
        className="
          space-y-2
        "
      >

        <label
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Country
        </label>


        <div
          className="
            relative
          "
        >

<Select

  value={selectedCountry}

  onValueChange={(value)=>{

    setSelectedCountry(value);

    // clear previously selected league
    onSelect('');

  }}

>

  <SelectTrigger

    className="
      h-12
      w-full
      rounded-xl
      border
      border-border
      bg-background/60
      px-6
      pr-10
      text-sm
      font-semibold
      transition
      hover:border-primary/50
      focus:border-primary
      focus:ring-4
      focus:ring-primary/10
    "

  >

    <SelectValue
      placeholder="Select Country"
    />

  </SelectTrigger>


  <SelectContent>

    {
      countries.map(
        country => (

          <SelectItem
            key={country}
            value={country}
          >

            {country}

          </SelectItem>

        )
      )
    }

  </SelectContent>


</Select>



        </div>


      </div>







      {/* LEAGUE */}

      <div
        className="
          space-y-2
        "
      >

        <label
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          League
        </label>


        <div
          className="
            relative
          "
        >

<Select

  value={selectedLeague}

  disabled={!selectedCountry}

  onValueChange={(value)=>{

    onSelect(value);

  }}

>


  <SelectTrigger

    className="
      h-12
      w-full
      rounded-xl
      border
      border-border
      bg-background/60
      pl-12
      pr-10
      text-sm
      font-semibold
      transition
      disabled:cursor-not-allowed
      disabled:opacity-50
      hover:border-primary/50
      focus:border-primary
      focus:ring-4
      focus:ring-primary/10
    "

  >

    <SelectValue

      placeholder={
        selectedCountry
          ? "Select League"
          : "Select Country First"
      }

    />


  </SelectTrigger>



  <SelectContent>


    {
      filteredLeagues.map(
        league => (

          <SelectItem

            key={league.code}

            value={league.code}

          >

            {league.name}

          </SelectItem>

        )
      )
    }


  </SelectContent>


</Select>




          {/* LOGO */}

          <div
            className="
              pointer-events-none
              absolute
              left-2
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-lg
              bg-background
              border
              border-border
            "
          >

            {
              activeLeague?.emblem ? (

                <Image
                  src={activeLeague.emblem}
                  alt={activeLeague.name}
                  width={24}
                  height={24}
                  className="
                    h-5
                    w-5
                    object-contain
                  "
                />

              ) : (

                <Trophy
                  size={16}
                  className="text-primary"
                />

              )
            }

          </div>



        </div>


      </div>


    </div>


  </div>


</section>

  );

}