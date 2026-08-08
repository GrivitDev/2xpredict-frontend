import {
  BadgeCheck,
  Crown,
  Mail,
  Phone,
  UserRound,
  Sparkles,
} from 'lucide-react';

import {
  type ElementType,
  type ReactNode,
} from 'react';



function MiniStat({
  icon: Icon,
  label,
  value,
}:{
  icon:ElementType;
  label:string;
  value:ReactNode;
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
          items-start
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
              text-foreground
            "
          />

        </div>


        <div className="min-w-0">

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
              truncate
              text-base
              font-semibold
              tracking-tight
            "
          >
            {value}
          </p>

        </div>

      </div>

    </div>

  );

}




export function IdentityCard({
  name,
  username,
  email,
  phoneNumber,
  plan,
}: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  plan?: string | null;
}) {


  const currentPlan =
    plan?.toLowerCase() || 'free';



  const membership = {

    vip:{
      label:'VIP',
      icon:Crown,
      className:
        `
          bg-gradient-to-br
          from-amber-400
          to-yellow-600
          text-white
          shadow-amber-500/30
        `,
      badgeClass:
        `
          bg-amber-500/10
          text-amber-500
        `,
    },


    regular:{
      label:'Regular',
      icon:BadgeCheck,
      className:
        `
          bg-primary
          text-primary-foreground
          shadow-primary/30
        `,
      badgeClass:
        `
          bg-primary/10
          text-primary
        `,
    },


    free:{
      label:'FREE',
      icon:Sparkles,
      className:
        `
          bg-muted
          text-muted-foreground
        `,
      badgeClass:
        `
          bg-muted
          text-muted-foreground
        `,
    },

  }[currentPlan] || {

    label:'FREE',
    icon:Sparkles,
    className:
      `
        bg-muted
        text-muted-foreground
      `,
    badgeClass:
      `
        bg-muted
        text-muted-foreground
      `,

  };



  const MembershipIcon =
    membership.icon;



  return (

    <div
      className="
        rounded-3xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
      "
    >


      <div
        className="
          mb-4
          flex
          items-center
          gap-3
        "
      >


        <div
          className="
            relative
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-border
            bg-muted/40
          "
        >

          <UserRound
            className="
              h-6
              w-6
            "
          />



          <div
            className={`
              absolute
              -right-2
              -top-2
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              shadow-lg
              ${membership.className}
            `}
          >

            <MembershipIcon
              className="
                h-4
                w-4
              "
            />

          </div>


        </div>





        <div
          className="
            min-w-0
          "
        >

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <h3
              className="
                truncate
                text-base
                font-semibold
                tracking-tight
                sm:text-lg
              "
            >
              {name || 'User'}
            </h3>



            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                ${membership.badgeClass}
              `}
            >
              {membership.label}
            </span>


          </div>



          <p
            className="
              truncate
              text-sm
              text-muted-foreground
            "
          >
            {
              username
              ? `@${username}`
              : 'No username'
            }
          </p>


        </div>


      </div>




      <div
        className="
          grid
          gap-3
          sm:grid-cols-2
        "
      >

        <MiniStat
          icon={Mail}
          label="Email"
          value={email || '—'}
        />


        <MiniStat
          icon={Phone}
          label="Phone"
          value={phoneNumber || '—'}
        />


      </div>


    </div>

  );

}