'use client';

import { useRouter } from 'next/navigation';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  z,
} from 'zod';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  Promo,
  CreatePromoPayload,
} from '@/types/promo';

import {
  createPromo,
  updatePromo,
} from '@/services/admin-promos.service';

import {
  PROMO_CAMPAIGN_OPTIONS,
  PROMO_REQUIREMENT_OPTIONS,
  REWARD_TYPE_OPTIONS,
  REWARD_PLAN_OPTIONS,
  CLAIM_OPTIONS,
} from '@/constants/promo';

const schema = z.object({
  name: z.string().min(3),

  description: z.string().optional(),

  campaignType: z.enum([
    'direct',
    'referral',
  ]),

  startDate: z.string(),

  endDate: z.string(),

  requirement: z.enum([
    'register',
    'regular_subscription',
    'vip_subscription',
    'any_subscription',
    'prediction_purchase',
  ]),

  targetCount: z.coerce.number(),

  maxClaims: z.coerce.number(),

  rewardType: z.enum([
    'subscription',
    'cash',
  ]),

  rewardPlan: z.enum([
    'regular',
    'vip',
  ]).optional(),

  rewardDurationDays: z.coerce.number().optional(),

  rewardAmount: z.coerce.number().optional(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface PromoFormProps {
  promo?: Promo;
}

export default function PromoForm({
  promo,
}: PromoFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<
    FormValues,
    any,
    FormOutput
  >({
    resolver: zodResolver(schema),

    defaultValues: {
      name: promo?.name ?? '',

      description: promo?.description ?? '',

      campaignType:
        promo?.campaignType ?? 'referral',

      startDate:
        promo?.startDate?.slice(0, 10) ?? '',

      endDate:
        promo?.endDate?.slice(0, 10) ?? '',

      requirement:
        promo?.requirement ?? 'register',

      targetCount:
        promo?.targetCount ?? 1,

      maxClaims:
        promo?.maxClaims ?? 1,

      rewardType:
        promo?.rewardType ?? 'subscription',

      rewardPlan:
        promo?.rewardPlan,

      rewardDurationDays:
        promo?.rewardDurationDays,

      rewardAmount:
        promo?.rewardAmount,
    },
  });

  const rewardType = form.watch('rewardType');

  const mutation = useMutation({
    mutationFn: (
      values: CreatePromoPayload,
    ) =>
      promo
        ? updatePromo(
            promo._id,
            values,
          )
        : createPromo(values),

    onSuccess: () => {
      toast.success(
        promo
          ? 'Promo updated'
          : 'Promo created',
      );

      queryClient.invalidateQueries({
        queryKey: ['admin-promos'],
      });

      router.push('/admin/promos');
    },

    onError: () => {
      toast.error('Something went wrong');
    },
  });

  const submit = (values: FormOutput) => {
    mutation.mutate(values);
  };

  const fieldError = (
    name: keyof FormValues,
  ) => {
    const error = form.formState.errors[name];

    return error?.message
      ? String(error.message)
      : null;
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>
          {promo ? 'Edit Promo' : 'Create Promo'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-5"
        >
          <FormField
            label="Promo Name"
            error={fieldError('name')}
          >
            <Input
              {...form.register('name')}
              placeholder="Enter promo name"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField
            label="Description"
            error={fieldError('description')}
          >
            <Textarea
              {...form.register('description')}
              placeholder="Describe this promotional campaign"
              className="min-h-24 rounded-xl resize-none"
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Campaign Type"
              error={fieldError('campaignType')}
            >
              <Select
                value={form.watch('campaignType')}
                onValueChange={(value) =>
                  form.setValue(
                    'campaignType',
                    value as FormValues['campaignType'],
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>

                <SelectContent>
                  {PROMO_CAMPAIGN_OPTIONS.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Requirement"
              error={fieldError('requirement')}
            >
              <Select
                value={form.watch('requirement')}
                onValueChange={(value) =>
                  form.setValue(
                    'requirement',
                    value as FormValues['requirement'],
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select requirement" />
                </SelectTrigger>

                <SelectContent>
                  {PROMO_REQUIREMENT_OPTIONS.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Start Date"
              error={fieldError('startDate')}
            >
              <Input
                type="date"
                {...form.register('startDate')}
                className="h-11 rounded-xl"
              />
            </FormField>

            <FormField
              label="End Date"
              error={fieldError('endDate')}
            >
              <Input
                type="date"
                {...form.register('endDate')}
                className="h-11 rounded-xl"
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Required Count"
              error={fieldError('targetCount')}
            >
              <Input
                type="number"
                min="1"
                {...form.register('targetCount')}
                className="h-11 rounded-xl"
              />
            </FormField>

            <FormField
              label="Maximum Claims"
              error={fieldError('maxClaims')}
            >
              <Select
                value={String(
                  form.watch('maxClaims'),
                )}
                onValueChange={(value) =>
                  form.setValue(
                    'maxClaims',
                    Number(value),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select maximum claims" />
                </SelectTrigger>

                <SelectContent>
                  {CLAIM_OPTIONS.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={String(item.value)}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Reward Type"
            error={fieldError('rewardType')}
          >
            <Select
              value={form.watch('rewardType')}
              onValueChange={(value) =>
                form.setValue(
                  'rewardType',
                  value as FormValues['rewardType'],
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select reward type" />
              </SelectTrigger>

              <SelectContent>
                {REWARD_TYPE_OPTIONS.map(
                  (item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </FormField>

          {rewardType === 'subscription' && (
            <div className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 md:grid-cols-2">
              <FormField
                label="Reward Plan"
                error={fieldError('rewardPlan')}
              >
                <Select
                  value={
                    form.watch('rewardPlan') ?? ''
                  }
                  onValueChange={(value) =>
                    form.setValue(
                      'rewardPlan',
                      value as FormValues['rewardPlan'],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl bg-background">
                    <SelectValue placeholder="Select reward plan" />
                  </SelectTrigger>

                  <SelectContent>
                    {REWARD_PLAN_OPTIONS.map(
                      (item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Duration"
                error={fieldError(
                  'rewardDurationDays',
                )}
              >
                <Input
                  type="number"
                  min="1"
                  placeholder="Duration in days"
                  {...form.register(
                    'rewardDurationDays',
                  )}
                  className="h-11 rounded-xl bg-background"
                />
              </FormField>
            </div>
          )}

          {rewardType === 'cash' && (
            <FormField
              label="Reward Amount"
              error={fieldError('rewardAmount')}
            >
              <Input
                type="number"
                min="0"
                placeholder="Enter reward amount"
                {...form.register('rewardAmount')}
                className="h-11 rounded-xl"
              />
            </FormField>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-11 rounded-xl px-6"
            >
              {mutation.isPending
                ? 'Saving...'
                : promo
                  ? 'Update Promo'
                  : 'Create Promo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-s font-semibold">
        {label}
      </Label>

      {children}

      {error && (
        <p className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}