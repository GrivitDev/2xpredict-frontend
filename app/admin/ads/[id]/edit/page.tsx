'use client';

import Link from 'next/link';

import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { AdForm } from '@/components/admin/ads/AdForm';

import { useAdminAd } from '@/hooks/useAdminAds';

export default function EditAdPage() {
  const params = useParams();

  const id = params.id as string;

  const {
    data: ad,
    isLoading,
    isError,
  } = useAdminAd(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <p className="text-s text-muted-foreground">
          Loading advertisement...
        </p>
      </div>
    );
  }

  if (isError || !ad) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <p className="text-s text-destructive">
          Advertisement not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <Button
          variant="outline"
          size="icon"
          asChild
          aria-label="Back to advertisements"
        >
          <Link href="/admin/ads">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Advertisement
          </h1>

          <p className="mt-1 text-s text-muted-foreground">
            Update advertisement details and display rules.
          </p>
        </div>
      </div>

      {/* FORM */}

      <Card className="surface">
        <CardHeader>
          <CardTitle>
            Advertisement Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <AdForm
            mode="edit"
            defaultValues={ad}
          />
        </CardContent>
      </Card>
    </div>
  );
}