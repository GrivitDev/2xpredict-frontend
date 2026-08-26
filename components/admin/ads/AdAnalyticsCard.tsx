'use client';

import { LucideIcon } from 'lucide-react';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface AdAnalyticsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}

export function AdAnalyticsCard({
  title,
  value,
  icon: Icon,
  description,
}: AdAnalyticsCardProps) {
  return (
    <Card
      className="
        border
        bg-card
        shadow-sm
        transition-colors
        hover:bg-muted/20
      "
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {title}
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {typeof value === 'number'
                ? value.toLocaleString()
                : value}
            </p>

            {description && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              bg-muted/40
              text-muted-foreground
            "
          >
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}