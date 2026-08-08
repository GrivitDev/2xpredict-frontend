import { Badge } from '@/components/ui/badge';

import { Promo } from '@/types/promo';



interface PromoStatusBadgeProps {

  promo:Promo;

}



export default function PromoStatusBadge({
  promo,
}:PromoStatusBadgeProps) {


  const now = new Date();


  const startDate = new Date(
    promo.startDate,
  );


  const endDate = new Date(
    promo.endDate,
  );



  let status:
    | 'Active'
    | 'Upcoming'
    | 'Expired'
    | 'Disabled';



  if (!promo.isActive) {

    status = 'Disabled';

  } else if (now < startDate) {

    status = 'Upcoming';

  } else if (now > endDate) {

    status = 'Expired';

  } else {

    status = 'Active';

  }



  const variants = {

    Active:
      'bg-success/10 text-success border-success/20',

    Upcoming:
      'bg-info/10 text-info border-info/20',

    Expired:
      'bg-muted text-muted-foreground',

    Disabled:
      'bg-destructive/10 text-destructive border-destructive/20',

  };



  return (

    <Badge
      variant="outline"
      className={variants[status]}
    >

      {status}

    </Badge>

  );

}