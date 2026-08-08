import {
  CalendarDays,
  BadgeCheck,
  Crown,
  CircleDollarSign,
  UserRound,
} from 'lucide-react';

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { fmtDate } from './dashboard.utils';



function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: ReactNode;
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-background/60
        p-4
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-border
            bg-muted/40
            p-2.5
          "
        >

          <Icon
            className="
              h-4
              w-4
            "
          />

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
              mt-1
              text-base
              font-semibold
            "
          >
            {value}
          </p>


        </div>


      </div>


    </div>
  );
}





function useCountdown(
  expiryDate?: string | Date | null,
) {

  const calculate = () => {

    if (!expiryDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }



    const difference =
      new Date(expiryDate).getTime() -
      Date.now();



    if (difference <= 0) {

      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };

    }



    return {

      days:
        Math.floor(
          difference /
          (1000 * 60 * 60 * 24),
        ),


      hours:
        Math.floor(
          (difference /
            (1000 * 60 * 60)) %
          24,
        ),


      minutes:
        Math.floor(
          (difference /
            (1000 * 60)) %
          60,
        ),


      seconds:
        Math.floor(
          (difference /
            1000) %
          60,
        ),

    };

  };



  const [
    time,
    setTime,
  ] = useState(
    calculate,
  );



  useEffect(() => {

    const timer =
      setInterval(
        () => {
          setTime(
            calculate(),
          );
        },
        1000,
      );



    return () =>
      clearInterval(timer);


  }, [
    expiryDate,
  ]);



  return time;

}






function getPlanTheme(
  plan?: string | null,
) {

  const current =
    plan?.toLowerCase();



  if (current === 'vip') {

    return {

      title:
        'VIP Membership',

      icon:
        Crown,

      label:
        'VIP',

      iconClass:
        'text-amber-400',

      wrapper:
        `
        border-amber-500/20
        bg-gradient-to-br
        from-amber-500/10
        via-background
        to-background
        `,

      iconWrapper:
        `
        bg-amber-500/10
        border-amber-500/20
        `,

      labelClass:
        'text-amber-400',

    };

  }




  if (current === 'regular') {

    return {

      title:
        'Regular Membership',

      icon:
        BadgeCheck,

      label:
        'Regular',

      iconClass:
        'text-blue-400',

      wrapper:
        `
        border-blue-500/20
        bg-gradient-to-br
        from-blue-500/10
        via-background
        to-background
        `,

      iconWrapper:
        `
        bg-blue-500/10
        border-blue-500/20
        `,

      labelClass:
        'text-blue-400',

    };

  }





  return {

    title:
      'Free Membership',

    icon:
      UserRound,

    label:
      'Free',

    iconClass:
      'text-muted-foreground',

    wrapper:
      `
      border-border
      bg-gradient-to-br
      from-muted/30
      via-background
      to-background
      `,

    iconWrapper:
      `
      bg-muted
      border-border
      `,

    labelClass:
      'text-muted-foreground',

  };

}






export function PlanCard({
  plan,
  startDate,
  expiresAt,
  revenue,
}: {
  plan?: string | null;
  startDate?: string | Date | null;
  expiresAt?: string | Date | null;
  revenue?: number | null;
}) {


  const countdown =
    useCountdown(
      expiresAt,
    );


  const theme =
    getPlanTheme(
      plan,
    );


  const PlanIcon =
    theme.icon;



  return (

    <div
      className="
        space-y-5
        rounded-3xl
        border
        border-border
        bg-card
        p-5
        shadow-sm
      "
    >


      {/* MEMBERSHIP HEADER */}

      <div
        className={`
          rounded-3xl
          border
          p-5
          ${theme.wrapper}
        `}
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              ${theme.iconWrapper}
            `}
          >

            <PlanIcon
              className={`
                h-7
                w-7
                ${theme.iconClass}
              `}
            />

          </div>




          <div>

            <div
              className={`
                text-sm
                font-semibold
                uppercase
                tracking-wider
                ${theme.labelClass}
              `}
            >
              {theme.label}
            </div>



            <h3
              className="
                text-xl
                font-bold
              "
            >
              {theme.title}
            </h3>



            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              Started {fmtDate(startDate)}
            </p>


          </div>


        </div>


      </div>





      {/* EXPIRY */}


      <div
        className="
          rounded-3xl
          border
          border-border
          bg-background/60
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

          <CalendarDays
            className="
              h-5
              w-5
            "
          />



          <div>

            <p
              className="
                text-xs
                text-muted-foreground
              "
            >
              Expires
            </p>



            <p
              className="
                font-semibold
              "
            >
              {fmtDate(expiresAt)}
            </p>


          </div>


        </div>





        <div
          className="
            mt-5
            grid
            grid-cols-4
            gap-2
          "
        >

          {
            [
              {
                value:
                  countdown.days,
                label:
                  'Days',
              },

              {
                value:
                  countdown.hours,
                label:
                  'Hours',
              },

              {
                value:
                  countdown.minutes,
                label:
                  'Minutes',
              },

              {
                value:
                  countdown.seconds,
                label:
                  'Seconds',
              },

            ].map((item)=>(

              <div
                key={item.label}
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-card
                  p-3
                  text-center
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    tabular-nums
                  "
                >
                  {String(item.value).padStart(2,'0')}
                </p>



                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  {item.label}
                </p>


              </div>


            ))
          }


        </div>


      </div>





      {/* STATS */}


      <div
        className="
          grid
          gap-3
          sm:grid-cols-2
        "
      >

        <MiniStat
          icon={CircleDollarSign}
          label="Subscription Value"
          value={
            `₦${(
              revenue ?? 0
            ).toLocaleString('en-GB')}`
          }
        />



        <MiniStat
          icon={BadgeCheck}
          label="Status"
          value="Active"
        />

      </div>



    </div>

  );

}