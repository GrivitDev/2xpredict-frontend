'use client';


import {
  Badge,
} from '@/components/ui/badge';



interface ReferralStatusBadgeProps {

  label:string;

  active:boolean;

}



export default function ReferralStatusBadge({

  label,

  active,

}:ReferralStatusBadgeProps){


  return (

    <Badge

      variant={
        active
          ? 'default'
          : 'secondary'
      }

      className={
        active
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-muted text-muted-foreground'
      }

    >

      {label}

    </Badge>

  );

}