'use client';

import Link from 'next/link';

import {
  Edit,
  Trash2,
  Power,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { AdminAd } from '@/types/ad';

interface AdTableProps {
  ads: AdminAd[];
  onDelete?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export function AdTable({
  ads,
  onDelete,
  onToggle,
}: AdTableProps) {
  if (ads.length === 0) {
    return (
      <div
        className="
          rounded-lg
          border
          border-dashed
          px-4
          py-8
          text-center
        "
      >
        <p className="text-sm text-muted-foreground">
          No advertisements found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {ads.map((ad) => {
        const ctr =
          ad.impressions > 0
            ? (
                (ad.clicks / ad.impressions) *
                100
              ).toFixed(2)
            : '0.00';

        return (
          <div
            key={ad._id}
            className="
              rounded-lg
              border
              bg-card
              px-3
              py-2.5
              shadow-sm
              transition-colors
              hover:bg-muted/20
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* Advertisement */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-medium">
                    {ad.title}
                  </h3>

                  <Badge
                    variant={
                      ad.isActive
                        ? 'default'
                        : 'secondary'
                    }
                    className="h-5 shrink-0 px-1.5 text-[10px]"
                  >
                    {ad.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </Badge>
                </div>

                {ad.subTitle && (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {ad.subTitle}
                  </p>
                )}

                <div
                  className="
                    mt-1.5
                    flex
                    flex-wrap
                    items-center
                    gap-x-3
                    gap-y-0.5
                    text-[11px]
                    text-muted-foreground
                  "
                >
                  <span>
                    {ad.impressions.toLocaleString()} views
                  </span>

                  <span>
                    {ad.clicks.toLocaleString()} clicks
                  </span>

                  <span>
                    {ctr}% CTR
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="h-7 px-2 text-xs"
                >
                  <Link
                    href={`/admin/ads/${ad._id}/edit`}
                  >
                    <Edit className="mr-1.5 size-3.5" />
                    Edit
                  </Link>
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    onToggle?.(ad._id)
                  }
                  className="
                    size-7
                    text-muted-foreground
                    hover:text-foreground
                  "
                  aria-label={
                    ad.isActive
                      ? 'Deactivate advertisement'
                      : 'Activate advertisement'
                  }
                >
                  <Power className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    onDelete?.(ad._id)
                  }
                  className="
                    size-7
                    text-muted-foreground
                    hover:bg-destructive/10
                    hover:text-destructive
                  "
                  aria-label="Delete advertisement"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}