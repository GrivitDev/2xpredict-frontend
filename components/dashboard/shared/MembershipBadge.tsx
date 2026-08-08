'use client';

import {
  Crown,
  BadgeCheck,
  UserRound,
} from 'lucide-react';


interface MembershipBadgeProps {
  plan?: string | null;
}



export function MembershipBadge({
  plan,
}: MembershipBadgeProps) {


  const membership =
    plan?.toLowerCase() || 'free';



  if (membership === 'vip') {

    return (
      <div
        className="
          absolute
          -right-1
          -top-1
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          border
          border-amber-400/30
          bg-gradient-to-br
          from-amber-400
          to-yellow-600
          shadow-lg
          shadow-amber-500/30
        "
      >

        <Crown
          className="
            h-3.5
            w-3.5
            text-white
          "
        />

      </div>
    );

  }



  if (membership === 'regular') {

    return (
      <div
        className="
          absolute
          -right-1
          -top-1
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          border
          border-primary/30
          bg-primary
          shadow-lg
          shadow-primary/30
        "
      >

        <BadgeCheck
          className="
            h-3.5
            w-3.5
            text-white
          "
        />

      </div>
    );

  }



  return (
    <div
      className="
        absolute
        -right-1
        -top-1
        flex
        h-6
        w-6
        items-center
        justify-center
        rounded-full
        border
        border-border
        bg-muted
      "
    >

      <UserRound
        className="
          h-3.5
          w-3.5
          text-muted-foreground
        "
      />

    </div>
  );

}