'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';

import PromoForm from '@/components/admin/promos/PromoForm';
import PromoRewards from '@/components/admin/promos/PromoRewards';

import { getPromo } from '@/services/admin-promos.service';

export default function EditPromoPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: promo,
    isLoading,
  } = useQuery({
    queryKey: ['admin-promo', id],
    queryFn: () => getPromo(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        Promo not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Edit Promo
        </h1>

        <p className="mt-1 text-muted-foreground">
          Update promotional campaign settings.
        </p>
      </div>

      {/* Promo Form */}

      <PromoForm promo={promo} />

      {/* Rewards */}

      <PromoRewards promoId={id} />
    </div>
  );
}