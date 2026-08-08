'use client';

import {
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';


interface PricingPlan {

  id:'free' | 'regular' | 'vip';

  name:string;

  price:number;

  description:string;

  features:string[];

  popular?:boolean;

}


interface PricingCardProps {

  plan:PricingPlan;

  onSelect:(
    id:'free' | 'regular' | 'vip'
  )=>void;

}



export default function PricingCard({
  plan,
  onSelect,
}:PricingCardProps){


  const handleSelectPlan=()=>{

    if(plan.id==='free'){

      window.location.href='/register';

      return;

    }

    onSelect(plan.id);

  };


  const icons={

    free:ShieldCheck,

    regular:Trophy,

    vip:Crown,

  };


  const cardStyles={

    free:`
      border-border
      hover:border-primary/40
    `,

    regular:`
    border-blue-500
    bg-gradient-to-br
    from-blue-500/10
    via-blue-500/5
    to-background
    shadow-xl
    shadow-blue-500/20
    lg:scale-105
    `,

    vip:`
      border-yellow-500/30
      bg-gradient-to-b
      from-yellow-500/10
      via-background
      to-background
      shadow-xl
      shadow-yellow-500/15
    `,

  };


  const iconStyles={

    free:`
      bg-muted
      text-primary
    `,

    regular:`
    bg-blue-500/15
    text-blue-500
    ring-2
    ring-blue-500/20
    `,

    vip:`
      bg-yellow-500/15
      text-yellow-500
    `,

  };


  const buttonText={

    free:'Create Free Account',

    regular:'Subscribe Now',

    vip:'Become VIP Member',

  };


  const Icon=icons[plan.id];


  return (

    <div
      className={`
        relative
        rounded-3xl
        border
        p-8
        transition-all
        duration-500
        hover:-translate-y-2
        hover:shadow-2xl
        ${cardStyles[plan.id]}
      `}
    >


      {
        plan.id==='vip' && (

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-yellow-500/5
              via-transparent
              to-yellow-300/10
            "
          />

        )
      }


      {
        plan.popular && (

                <div
                className="
                    absolute
                    left-1/2
                    top-0
                    flex
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    gap-2
                    rounded-full
                    bg-blue-600
                    px-5
                    py-2
                    text-xs
                    font-bold
                    tracking-wider
                    text-white
                    shadow-xl
                    shadow-blue-500/30
                "
                >

                <Sparkles size={14}/>

                MOST POPULAR

                </div>

        )
      }


      <div className="relative">


        <div className="flex items-center gap-4">


          <div
            className={`
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              ${iconStyles[plan.id]}
            `}
          >

            <Icon size={30}/>

          </div>


          <div>

            <h2 className="text-2xl font-black">

              {plan.name}

            </h2>

            <p className="mt-1 text-sm text-muted-foreground">

              {plan.description}

            </p>

          </div>


        </div>




        <div className="mt-8">


          {
            plan.price===0 ? (

              <div>

                <span className="text-5xl font-black">

                  ₦0

                </span>

              </div>

            ):(

              <div className="flex items-end gap-2">

                <span className="text-5xl font-black">

                  ₦{plan.price.toLocaleString()}

                </span>

                <span className="mb-2 text-muted-foreground">

                  /30 Days

                </span>

              </div>

            )
          }


        </div>




        <div className="mt-10">


          <ul className="space-y-4">


            {
              plan.features.map(feature=>(

                <li
                  key={feature}
                  className="flex items-start gap-3"
                >

                  <div
                    className="
                      mt-0.5
                      rounded-full
                      bg-green-500/10
                      p-1
                    "
                  >

                    <Check
                      size={14}
                      className="text-green-500"
                    />

                  </div>

                  <span className="text-sm leading-6">

                    {feature}

                  </span>

                </li>

              ))
            }


          </ul>


        </div>




        <button
          onClick={handleSelectPlan}
          className={`
            mt-10
            flex
            w-full
            items-center
            justify-center
            rounded-xl
            py-3.5
            font-bold
            transition-all
            duration-300

            ${
              plan.id==='vip'
                ?`
                  bg-yellow-500
                  text-black
                  hover:bg-yellow-400
                `
                :`
                  bg-primary
                  text-primary-foreground
                  hover:opacity-90
                `
            }
          `}
        >

          {buttonText[plan.id]}

        </button>


      </div>


    </div>

  );

}