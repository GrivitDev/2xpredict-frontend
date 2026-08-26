'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AdImageUploader } from './AdImageUploader';
import { AdInstructionsBuilder } from './AdInstructionsBuilder';
import { AdActionBuilder } from './AdActionBuilder';
import { AdDisplayBuilder } from './AdDisplayBuilder';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useCreateAd,
  useUpdateAd,
} from '@/hooks/useAdminAds';

import {
  AdImage,
  AdminAd,
} from '@/types/ad';

import { AdAudience } from '@/constants/ads/ad-audience';

const adSchema = z.object({
  title: z
    .string()
    .min(2, 'Title is required'),

  subTitle: z
    .string()
    .optional(),

  description: z
    .string()
    .optional(),

  priority: z.coerce
    .number()
    .min(1)
    .max(10),
});

type FormValues = z.input<typeof adSchema>;
type FormOutput = z.output<typeof adSchema>;

interface AdFormProps {
  mode: 'create' | 'edit';
  defaultValues?: AdminAd;
}

export function AdForm({
  mode,
  defaultValues,
}: AdFormProps) {
  const router = useRouter();

  const [image, setImage] = useState<AdImage | undefined>(
    defaultValues?.image,
  );

  const [actions, setActions] = useState(
    defaultValues?.actions ?? [],
  );

  const [displays, setDisplays] = useState(
    defaultValues?.displays ?? [],
  );

  const [instructions, setInstructions] = useState(
    defaultValues?.instructions ?? [],
  );

  const [isActive, setIsActive] = useState(
    defaultValues?.isActive ?? true,
  );

  const [audience, setAudience] = useState<AdAudience>(
    defaultValues?.audience ?? AdAudience.ALL,
  );

  const [startDate, setStartDate] = useState(
    defaultValues?.startDate ?? '',
  );

  const [endDate, setEndDate] = useState(
    defaultValues?.endDate ?? '',
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      subTitle: defaultValues?.subTitle ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 5,
    },
  });

  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending;

  function submit(values: FormOutput) {
    if (
      startDate &&
      endDate &&
      new Date(startDate) > new Date(endDate)
    ) {
      alert('End date must be after start date');
      return;
    }

    if (displays.length === 0) {
      alert('Please add at least one display placement');
      return;
    }

    if (!image) {
      alert('Please add an image for the advertisement');
      return;
    }

    const payload = {
      ...values,
      audience,
      image,
      actions,
      displays,
      instructions,
      isActive,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          router.push('/admin/ads');
        },
      });

      return;
    }

    if (!defaultValues?._id) {
      return;
    }

    updateMutation.mutate(
      {
        id: defaultValues._id,
        data: payload,
      },
      {
        onSuccess: () => {
          router.push('/admin/ads');
        },
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="space-y-4"
    >
      {/* BASIC DETAILS */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <div className="mb-3">
          <p className="text-sm font-medium">
            Basic Details
          </p>

          <p className="text-[11px] text-muted-foreground">
            Define the main content of the advertisement.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <Label className="text-xs">
              Title
            </Label>

            <Input
              {...form.register('title')}
              placeholder="Advertisement title"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              Subtitle
            </Label>

            <Input
              {...form.register('subTitle')}
              placeholder="Short subtitle"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              Description
            </Label>

            <Textarea
              {...form.register('description')}
              placeholder="Advertisement description"
              className="min-h-20 resize-none text-sm"
            />
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <div className="mb-2">
          <p className="text-sm font-medium">
            Audience
          </p>

          <p className="text-[11px] text-muted-foreground">
            Choose who can see this advertisement.
          </p>
        </div>

        <Select
          value={audience}
          onValueChange={(value) =>
            setAudience(value as AdAudience)
          }
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={AdAudience.ALL}>
              Everyone
            </SelectItem>

            <SelectItem value={AdAudience.GUEST}>
              Guests
            </SelectItem>

            <SelectItem value={AdAudience.FREE}>
              Free Members
            </SelectItem>

            <SelectItem value={AdAudience.REGULAR}>
              Regular Members
            </SelectItem>

            <SelectItem value={AdAudience.VIP}>
              VIP Members
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* INSTRUCTIONS */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <AdInstructionsBuilder
          value={instructions}
          onChange={setInstructions}
        />
      </section>

      {/* ACTIONS */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <AdActionBuilder
          value={actions}
          onChange={setActions}
        />
      </section>

      {/* IMAGE */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <AdImageUploader
          value={image}
          onChange={setImage}
        />
      </section>

      {/* DISPLAY RULES */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <AdDisplayBuilder
          value={displays}
          onChange={setDisplays}
        />
      </section>

      {/* SCHEDULE */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <div className="mb-3">
          <p className="text-sm font-medium">
            Schedule
          </p>

          <p className="text-[11px] text-muted-foreground">
            Optionally control when the advertisement is active.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">
              Start Date
            </Label>

            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              End Date
            </Label>

            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="h-9 text-sm"
            />
          </div>
        </div>
      </section>

      {/* SETTINGS */}
      <section
        className="
          rounded-lg
          border
          bg-card
          p-3
          shadow-sm
        "
      >
        <div className="mb-3">
          <p className="text-sm font-medium">
            Settings
          </p>

          <p className="text-[11px] text-muted-foreground">
            Configure priority and activation status.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">
              Priority
            </Label>

            <Input
              type="number"
              min={1}
              max={10}
              {...form.register('priority')}
              className="h-9 text-sm"
            />
          </div>

          <div
            className="
              flex
              h-9
              items-center
              justify-between
              rounded-md
              border
              px-3
            "
          >
            <Label className="text-xs">
              Active
            </Label>

            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="scale-90"
            />
          </div>
        </div>
      </section>

      {/* SUBMIT */}
      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isPending}
          className="h-9 px-4"
        >
          {isPending
            ? mode === 'create'
              ? 'Creating...'
              : 'Updating...'
            : mode === 'create'
              ? 'Create Advertisement'
              : 'Update Advertisement'}
        </Button>
      </div>
    </form>
  );
}