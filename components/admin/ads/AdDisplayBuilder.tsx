'use client';

import {
  Plus,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

import { AdPage } from '@/constants/ads/ad-page';
import { AdDevice } from '@/constants/ads/ad-device';
import { AdPosition } from '@/constants/ads/ad-position';
import { AdTrigger } from '@/constants/ads/ad-trigger';
import { AdDisplay } from '@/types/ad';

interface AdDisplayBuilderProps {
  value: AdDisplay[];
  onChange: (value: AdDisplay[]) => void;
}

const pages = Object.values(AdPage);
const devices = Object.values(AdDevice);
const positions = Object.values(AdPosition);
const triggers = Object.values(AdTrigger);

export function AdDisplayBuilder({
  value,
  onChange,
}: AdDisplayBuilderProps) {
  function addDisplay() {
    onChange([
      ...value,
      {
        page: AdPage.HOME,
        position: AdPosition.HERO,
        device: AdDevice.ALL,
        trigger: AdTrigger.ALWAYS,
        fixed: false,
        displayOrder: value.length + 1,
      },
    ]);
  }

  function updateDisplay(
    index: number,
    key: keyof AdDisplay,
    val: AdDisplay[keyof AdDisplay],
  ) {
    onChange(
      value.map((display, i) =>
        i === index
          ? {
              ...display,
              [key]: val,
            }
          : display,
      ),
    );
  }

  function removeDisplay(index: number) {
    onChange(
      value.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">
            Display Rules
          </Label>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Choose where this advertisement appears.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDisplay}
          className="h-8 px-2.5"
        >
          <Plus className="mr-1.5 size-3.5" />
          Add
        </Button>
      </div>

      {/* Placements */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((display, index) => (
            <div
              key={index}
              className="
                rounded-lg
                border
                bg-card
                p-3
                shadow-sm
              "
            >
              {/* Placement header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="
                      flex
                      size-6
                      items-center
                      justify-center
                      rounded-md
                      bg-muted
                      text-[11px]
                      font-semibold
                      text-muted-foreground
                    "
                  >
                    {index + 1}
                  </span>

                  <span className="text-sm font-medium">
                    Placement
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDisplay(index)}
                  className="
                    size-7
                    text-muted-foreground
                    hover:bg-destructive/10
                    hover:text-destructive
                  "
                  aria-label={`Remove placement ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              {/* Main settings */}
              <div className="grid gap-2 md:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Page
                  </Label>

                  <Select
                    value={display.page}
                    onValueChange={(value) =>
                      updateDisplay(
                        index,
                        'page',
                        value as AdPage,
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {pages.map((page) => (
                        <SelectItem
                          key={page}
                          value={page}
                        >
                          {page}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Position
                  </Label>

                  <Select
                    value={display.position}
                    onValueChange={(value) =>
                      updateDisplay(
                        index,
                        'position',
                        value as AdPosition,
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem
                          key={position}
                          value={position}
                        >
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Device
                  </Label>

                  <Select
                    value={display.device}
                    onValueChange={(value) =>
                      updateDisplay(
                        index,
                        'device',
                        value as AdDevice,
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem
                          key={device}
                          value={device}
                        >
                          {device}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Trigger
                  </Label>

                  <Select
                    value={display.trigger}
                    onValueChange={(value) =>
                      updateDisplay(
                        index,
                        'trigger',
                        value as AdTrigger,
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {triggers.map((trigger) => (
                        <SelectItem
                          key={trigger}
                          value={trigger}
                        >
                          {trigger}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Secondary settings */}
              <div className="mt-2 flex items-end gap-2">
                <div className="w-32 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Order
                  </Label>

                  <Input
                    type="number"
                    min={1}
                    value={display.displayOrder}
                    onChange={(e) =>
                      updateDisplay(
                        index,
                        'displayOrder',
                        Number(e.target.value),
                      )
                    }
                    className="h-8 text-xs"
                  />
                </div>

                <div
                  className="
                    flex
                    h-8
                    flex-1
                    items-center
                    justify-between
                    rounded-md
                    border
                    px-2.5
                  "
                >
                  <Label className="text-xs">
                    Fixed position
                  </Label>

                  <Switch
                    checked={display.fixed}
                    onCheckedChange={(checked) =>
                      updateDisplay(
                        index,
                        'fixed',
                        checked,
                      )
                    }
                    className="scale-90"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && (
        <div
          className="
            rounded-lg
            border
            border-dashed
            px-4
            py-5
            text-center
          "
        >
          <p className="text-xs text-muted-foreground">
            No display placements configured.
          </p>
        </div>
      )}
    </div>
  );
}