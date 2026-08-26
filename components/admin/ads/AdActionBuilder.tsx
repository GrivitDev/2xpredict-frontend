'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AdAction } from '@/types/ad';
import { AdPage } from '@/constants/ads/ad-page';
import { AD_ROUTES } from '@/constants/ads/ad-routes';

interface Props {
  value: AdAction[];
  onChange: (value: AdAction[]) => void;
}

export function AdActionBuilder({
  value,
  onChange,
}: Props) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [selectedPage, setSelectedPage] =
    useState<AdPage>();

  function handlePageSelect(page: AdPage) {
    setSelectedPage(page);
    setUrl(AD_ROUTES[page]);
  }

  function addAction() {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();

    if (!trimmedLabel || !trimmedUrl) {
      return;
    }

    onChange([
      ...value,
      {
        label: trimmedLabel,
        url: trimmedUrl,
      },
    ]);

    setLabel('');
    setUrl('');
    setSelectedPage(undefined);
  }

  function removeAction(index: number) {
    onChange(
      value.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Actions
        </Label>

        {value.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {value.length} {value.length === 1 ? 'action' : 'actions'}
          </span>
        )}
      </div>

      <div
        className="
          rounded-lg
          border
          bg-card
          p-2
          shadow-sm
        "
      >
        <div
          className="
            grid
            gap-2
            md:grid-cols-[1fr_1fr_1.2fr_auto]
          "
        >
          <Input
            value={label}
            onChange={(e) =>
              setLabel(e.target.value)
            }
            placeholder="Button label"
            className="h-9 text-sm"
          />

          <Select
            value={selectedPage}
            onValueChange={(page) =>
              handlePageSelect(page as AdPage)
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Internal page" />
            </SelectTrigger>

            <SelectContent>
              {Object.values(AdPage).map((page) => (
                <SelectItem
                  key={page}
                  value={page}
                >
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            placeholder="/payments or https://..."
            className="h-9 text-sm"
          />

          <Button
            type="button"
            size="sm"
            onClick={addAction}
            className="h-9 px-3"
          >
            Add
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((action, index) => (
            <div
              key={`${action.url}-${index}`}
              className="
                group
                flex
                items-center
                justify-between
                gap-3
                rounded-lg
                border
                bg-background
                px-3
                py-2
                transition-colors
                hover:bg-muted/40
              "
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {action.label}
                </p>

                <p className="truncate text-[11px] text-muted-foreground">
                  {action.url}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAction(index)}
                className="
                  h-7
                  shrink-0
                  px-2
                  text-xs
                  text-muted-foreground
                  hover:bg-destructive/10
                  hover:text-destructive
                "
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}