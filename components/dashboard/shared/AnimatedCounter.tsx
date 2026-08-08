'use client';

import {
  animate,
} from 'framer-motion';

import {
  useEffect,
  useRef,
  useState,
} from 'react';


interface AnimatedCounterProps {

  value:number;

  duration?:number;

  className?:string;

  prefix?:string;

  suffix?:string;

}



export function AnimatedCounter({

  value,

  duration = 1.2,

  className = '',

  prefix = '',

  suffix = '',

}:AnimatedCounterProps) {


  const previousValue =
    useRef(0);



  const [count,setCount] =
    useState(value);



  useEffect(()=>{


    const controls =
      animate(
        previousValue.current,
        value,
        {

          duration,

          ease:
            'easeOut',


          onUpdate(latest){

            setCount(
              Math.round(latest),
            );

          },


          onComplete(){

            previousValue.current =
              value;

          },

        },
      );



    return ()=>{

      controls.stop();

    };


  },[
    value,
    duration,
  ]);





  const formatted =
    new Intl.NumberFormat(
      'en-GB',
    ).format(count);





  return (

    <span

      className={`
        inline-flex
        items-center
        tabular-nums
        tracking-tight
        ${className}
      `}

    >

      {prefix}

      {formatted}

      {suffix}

    </span>

  );

}