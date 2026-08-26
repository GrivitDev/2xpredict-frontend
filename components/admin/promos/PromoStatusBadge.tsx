import { Badge } from '@/components/ui/badge';

import type { Promo } from '@/types/promo';

interface PromoStatusBadgeProps {
  promo: Promo;
}

type PromoStatus =
  | 'Active'
  | 'Upcoming'
  | 'Expired'
  | 'Disabled';

const STATUS_CLASSES: Record<PromoStatus, string> = {
  Active:
    'border-success/20 bg-success/10 text-success',

  Upcoming:
    'border-info/20 bg-info/10 text-info',

  Expired:
    'bg-muted text-muted-foreground',

  Disabled:
    'border-destructive/20 bg-destructive/10 text-destructive',
};

function getPromoStatus(promo: Promo): PromoStatus {
  if (!promo.isActive) {
    return 'Disabled';
  }

  const now = Date.now();
  const startDate = new Date(promo.startDate).getTime();
  const endDate = new Date(promo.endDate).getTime();

  if (now < startDate) {
    return 'Upcoming';
  }

  if (now >= endDate) {
    return 'Expired';
  }

  return 'Active';
}

export default function PromoStatusBadge({
  promo,
}: PromoStatusBadgeProps) {
  const status = getPromoStatus(promo);

  return (
    <Badge
      variant="outline"
      className={STATUS_CLASSES[status]}
    >
      {status}
    </Badge>
  );
}