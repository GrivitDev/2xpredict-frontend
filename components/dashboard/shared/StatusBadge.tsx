'use client';

import {
  Badge,
} from '@/components/ui/badge';


interface StatusBadgeProps {
  status?: string;
}



export function StatusBadge({
  status,
}:StatusBadgeProps) {


  const normalized =
    status?.toLowerCase() ?? 'unknown';



  const label =
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1);



  const baseClass = `
    rounded-full
    px-3
    py-1
    text-[11px]
    font-semibold
    uppercase
    tracking-wide
    sm:text-xs
  `;



  if (
    [
      'active',
      'paid',
      'completed',
      'approved',
      'success',
      'registered',
      'joined',
    ].includes(normalized)
  ) {

    return (
      <Badge
        className={baseClass}
      >
        {label}
      </Badge>
    );

  }



  if (
    [
      'pending',
      'processing',
      'waiting',
    ].includes(normalized)
  ) {

    return (
      <Badge
        variant="secondary"
        className={baseClass}
      >
        {label}
      </Badge>
    );

  }



  if (
    [
      'failed',
      'cancelled',
      'expired',
      'rejected',
      'inactive',
    ].includes(normalized)
  ) {

    return (
      <Badge
        variant="destructive"
        className={baseClass}
      >
        {label}
      </Badge>
    );

  }



  return (
    <Badge
      variant="outline"
      className={baseClass}
    >
      {label}
    </Badge>
  );

}