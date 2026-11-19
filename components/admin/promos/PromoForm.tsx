'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPromo, updatePromo } from '@/services/promos.service';
import type {
  CreatePromoPayload,
  Promo,
  PromoCampaignType,
  PromoCurrency,
  PromoDiscountType,
  PromoEligibilityRules,
  PromoPlan,
  PromoPromotionKind,
  PromoPurpose,
  PromoRewardType,
} from '@/types/promos';

type FormState = {
  name: string;
  description: string;
  promoCode: string;
  campaignType: PromoCampaignType;
  promotionKind: PromoPromotionKind;
  purpose: PromoPurpose;
  startDate: string;
  endDate: string;
  isActive: boolean;
  discountType: PromoDiscountType;
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  amountCurrency: PromoCurrency;
  eligiblePlans: PromoPlan[];
  perUserRedemptionLimit: string;
  totalRedemptionLimit: string;
  rewardType: PromoRewardType;
  rewardPlan: PromoPlan;
  rewardDurationDays: string;
  pointsAmount: string;
  requirement: string;
  targetCount: string;
  maxClaims: string;
  accountAgeMin: string;
  accountAgeMax: string;
  accountAgeUnit: 'days' | 'months' | 'years';
  verificationStatus: 'any' | 'verified' | 'unverified';
  subscriptionStatus:
    | 'any'
    | 'never_subscribed'
    | 'active'
    | 'renewal_due'
    | 'expired';
  previousPlan: PromoPlan | 'any';
  expiryDaysMin: string;
  expiryDaysMax: string;
  firstPurchaseOnly: boolean;
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const defaultState = (): FormState => ({
  name: '',
  description: '',
  promoCode: '',
  campaignType: 'direct',
  promotionKind: 'discount',
  purpose: 'general',
  startDate: today(),
  endDate: '',
  isActive: true,
  discountType: 'percentage',
  discountValue: '10',
  minPurchaseAmount: '',
  maxDiscountAmount: '',
  amountCurrency: 'NGN',
  eligiblePlans: ['regular', 'vip', 'premium'],
  perUserRedemptionLimit: '1',
  totalRedemptionLimit: '',
  rewardType: 'bet_lab_points',
  rewardPlan: 'regular',
  rewardDurationDays: '30',
  pointsAmount: '',
  requirement: 'any_subscription',
  targetCount: '1',
  maxClaims: '1',
  accountAgeMin: '',
  accountAgeMax: '',
  accountAgeUnit: 'months',
  verificationStatus: 'any',
  subscriptionStatus: 'any',
  previousPlan: 'any',
  expiryDaysMin: '',
  expiryDaysMax: '',
  firstPurchaseOnly: false,
});

const plans: PromoPlan[] = ['regular', 'vip', 'premium'];

const purposes: PromoPurpose[] = [
  'general',
  'first_purchase',
  'renewal',
  'win_back',
  'upgrade',
  'referral',
  'seasonal',
  'bulk',
  'bundle',
];

const field =
  'h-8 w-full rounded-md border bg-background px-2 text-xs outline-none focus:border-primary';

const label = 'mb-1 block text-[11px] font-medium text-muted-foreground';

const section = 'space-y-3 rounded-lg border bg-card p-3';

function toForm(promo?: Promo): FormState {
  const state = defaultState();

  if (!promo) return state;

  const rules = promo.eligibilityRules ?? {};

  return {
    ...state,
    name: promo.name ?? '',
    description: promo.description ?? '',
    promoCode: promo.promoCode ?? '',
    campaignType: promo.campaignType ?? 'direct',
    promotionKind: promo.promotionKind ?? 'discount',
    purpose: promo.purpose ?? 'general',
    startDate: promo.startDate?.slice(0, 10) ?? today(),
    endDate: promo.endDate?.slice(0, 10) ?? '',
    isActive: promo.isActive ?? true,
    discountType: promo.discountType ?? 'percentage',
    discountValue:
      promo.discountValue == null ? '' : String(promo.discountValue),
    minPurchaseAmount:
      promo.minPurchaseAmount == null
        ? ''
        : String(promo.minPurchaseAmount),
    maxDiscountAmount:
      promo.maxDiscountAmount == null
        ? ''
        : String(promo.maxDiscountAmount),
    amountCurrency: promo.amountCurrency ?? 'NGN',
    eligiblePlans: promo.eligiblePlans ?? [],
    perUserRedemptionLimit:
      promo.perUserRedemptionLimit == null
        ? ''
        : String(promo.perUserRedemptionLimit),
    totalRedemptionLimit:
      promo.totalRedemptionLimit == null
        ? ''
        : String(promo.totalRedemptionLimit),
    rewardType: promo.rewardType ?? 'bet_lab_points',
    rewardPlan: promo.rewardPlan ?? 'regular',
    rewardDurationDays:
      promo.rewardDurationDays == null
        ? '30'
        : String(promo.rewardDurationDays),
    pointsAmount:
      promo.pointsAmount == null ? '' : String(promo.pointsAmount),
    requirement: promo.requirement ?? 'any_subscription',
    targetCount: String(promo.targetCount ?? 1),
    maxClaims: String(promo.maxClaims ?? 1),
    accountAgeMin:
      rules.accountAge?.min == null
        ? ''
        : String(rules.accountAge.min),
    accountAgeMax:
      rules.accountAge?.max == null
        ? ''
        : String(rules.accountAge.max),
    accountAgeUnit: rules.accountAge?.unit ?? 'months',
    verificationStatus: rules.verificationStatus ?? 'any',
    subscriptionStatus: rules.subscriptionStatus ?? 'any',
    previousPlan: rules.previousPlan ?? 'any',
    expiryDaysMin:
      rules.daysSinceExpiry?.min == null
        ? ''
        : String(rules.daysSinceExpiry.min),
    expiryDaysMax:
      rules.daysSinceExpiry?.max == null
        ? ''
        : String(rules.daysSinceExpiry.max),
    firstPurchaseOnly: rules.firstPurchaseOnly ?? false,
  };
}

function optionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function toISOStringFromDate(
  value: string,
  endOfDay = false,
): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(
    `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`,
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date.toISOString();
}

export default function PromoForm({ promo }: { promo?: Promo }) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => toForm(promo));
  const [saving, setSaving] = useState(false);
  const [previousPromo, setPreviousPromo] = useState(promo);

  if (previousPromo !== promo) {
    setPreviousPromo(promo);
    setForm(toForm(promo));
  }

  const showDiscount =
    form.promotionKind === 'discount' ||
    form.promotionKind === 'bundle';

  const showReward =
    form.promotionKind === 'reward' ||
    form.promotionKind === 'bundle';

  const needsCurrency =
    form.discountType === 'fixed_amount' ||
    form.minPurchaseAmount !== '' ||
    form.maxDiscountAmount !== '';

  const isReferral =
    form.campaignType === 'referral' ||
    form.purpose === 'referral';

  const set = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const togglePlan = (plan: PromoPlan) => {
    set(
      'eligiblePlans',
      form.eligiblePlans.includes(plan)
        ? form.eligiblePlans.filter((item) => item !== plan)
        : [...form.eligiblePlans, plan],
    );
  };

  const payload = useMemo((): CreatePromoPayload => {
    const eligibilityRules: PromoEligibilityRules = {};

    if (form.accountAgeMin || form.accountAgeMax) {
      eligibilityRules.accountAge = {
        min: optionalNumber(form.accountAgeMin),
        max: optionalNumber(form.accountAgeMax),
        unit: form.accountAgeUnit,
      };
    }

    if (form.verificationStatus !== 'any') {
      eligibilityRules.verificationStatus = form.verificationStatus;
    }

    if (form.subscriptionStatus !== 'any') {
      eligibilityRules.subscriptionStatus = form.subscriptionStatus;
    }

    if (form.previousPlan !== 'any') {
      eligibilityRules.previousPlan = form.previousPlan;
    }

    if (form.expiryDaysMin || form.expiryDaysMax) {
      eligibilityRules.daysSinceExpiry = {
        min: optionalNumber(form.expiryDaysMin),
        max: optionalNumber(form.expiryDaysMax),
      };
    }

    if (form.firstPurchaseOnly) {
      eligibilityRules.firstPurchaseOnly = true;
    }

    const startDate = toISOStringFromDate(form.startDate);
    const endDate = toISOStringFromDate(form.endDate, true);

    return {
      name: form.name.trim(),
      campaignType: form.campaignType,
      description: form.description.trim() || undefined,
      promoCode: form.promoCode.trim() || undefined,
      promotionKind: form.promotionKind,
      purpose: form.purpose,
      startDate: startDate ?? '',
      endDate: endDate ?? '',
      isActive: form.isActive,

      ...(showDiscount
        ? {
            discountType: form.discountType,
            discountValue: optionalNumber(form.discountValue),
            minPurchaseAmount: optionalNumber(form.minPurchaseAmount),
            maxDiscountAmount: optionalNumber(form.maxDiscountAmount),
            ...(needsCurrency
              ? { amountCurrency: form.amountCurrency }
              : {}),
            eligiblePlans: form.eligiblePlans,
          }
        : {}),

      ...(showReward
        ? {
            rewardType: form.rewardType,
            ...(form.rewardType === 'subscription'
              ? {
                  rewardPlan: form.rewardPlan,
                  rewardDurationDays: optionalNumber(
                    form.rewardDurationDays,
                  ),
                }
              : {}),
            ...(form.pointsAmount.trim()
              ? {
                  pointsAmount: optionalNumber(form.pointsAmount),
                }
              : {}),
          }
        : {}),

      ...(isReferral
        ? {
            requirement:
              form.requirement as CreatePromoPayload['requirement'],
            targetCount: optionalNumber(form.targetCount),
            maxClaims: optionalNumber(form.maxClaims),
          }
        : {}),

      perUserRedemptionLimit: optionalNumber(
        form.perUserRedemptionLimit,
      ),
      totalRedemptionLimit: optionalNumber(
        form.totalRedemptionLimit,
      ),

      eligibilityRules:
        Object.keys(eligibilityRules).length > 0
          ? eligibilityRules
          : undefined,
    };
  }, [form, showDiscount, showReward, needsCurrency, isReferral]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim() || form.name.trim().length < 3) {
      toast.error('Campaign name must be at least 3 characters.');
      return;
    }

    const startDate = toISOStringFromDate(form.startDate);
    const endDate = toISOStringFromDate(form.endDate, true);

    if (!startDate || !endDate) {
      toast.error('Choose valid start and end dates.');
      return;
    }

    if (form.endDate < form.startDate) {
      toast.error('The end date cannot be before the start date.');
      return;
    }

    if (
      showDiscount &&
      (!form.discountValue.trim() ||
        !Number.isFinite(Number(form.discountValue)) ||
        Number(form.discountValue) <= 0)
    ) {
      toast.error('Enter a valid discount value.');
      return;
    }

    if (
      showDiscount &&
      form.discountType === 'percentage' &&
      Number(form.discountValue) > 100
    ) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    if (needsCurrency && !form.amountCurrency) {
      toast.error('Choose a currency for monetary limits.');
      return;
    }

    if (showDiscount && form.eligiblePlans.length === 0) {
      toast.error('Select at least one eligible plan.');
      return;
    }

    if (
      showReward &&
      form.rewardType === 'bet_lab_points' &&
      (!form.pointsAmount.trim() ||
        !Number.isFinite(Number(form.pointsAmount)) ||
        Number(form.pointsAmount) <= 0)
    ) {
      toast.error('Enter a valid Bet Lab points reward.');
      return;
    }

    if (
      showReward &&
      form.rewardType === 'subscription' &&
      (!Number.isFinite(Number(form.rewardDurationDays)) ||
        Number(form.rewardDurationDays) < 1)
    ) {
      toast.error('Enter a valid subscription reward duration.');
      return;
    }

    if (
      form.accountAgeMin &&
      form.accountAgeMax &&
      Number(form.accountAgeMin) > Number(form.accountAgeMax)
    ) {
      toast.error(
        'Minimum account age cannot exceed maximum account age.',
      );
      return;
    }

    if (
      form.expiryDaysMin &&
      form.expiryDaysMax &&
      Number(form.expiryDaysMin) > Number(form.expiryDaysMax)
    ) {
      toast.error(
        'Minimum expiry days cannot exceed maximum expiry days.',
      );
      return;
    }

    setSaving(true);

    try {
      const requestPayload: CreatePromoPayload = {
        ...payload,
        startDate,
        endDate,
      };

      if (promo?._id) {
        await updatePromo(promo._id, requestPayload);
      } else {
        await createPromo(requestPayload);
      }

      toast.success(
        promo ? 'Campaign updated' : 'Campaign created',
      );

      router.push('/admin/promos');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save campaign.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 text-sm">
      <section className={section}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Campaign details</h2>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                set('isActive', event.target.checked)
              }
            />
            Active
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className={label}>Campaign name *</span>
            <input
              className={field}
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              required
              minLength={3}
              maxLength={120}
            />
          </label>

          <label>
            <span className={label}>Promo code (optional)</span>
            <input
              className={field}
              value={form.promoCode}
              onChange={(event) =>
                set('promoCode', event.target.value.toUpperCase())
              }
              maxLength={60}
              placeholder="WELCOME20"
            />
          </label>

          <label>
            <span className={label}>Campaign audience</span>
            <select
              className={field}
              value={form.campaignType}
              onChange={(event) =>
                set(
                  'campaignType',
                  event.target.value as PromoCampaignType,
                )
              }
            >
              <option value="direct">Direct / users</option>
              <option value="referral">Referral</option>
            </select>
          </label>

          <label>
            <span className={label}>Promotion kind</span>
            <select
              className={field}
              value={form.promotionKind}
              onChange={(event) =>
                set(
                  'promotionKind',
                  event.target.value as PromoPromotionKind,
                )
              }
            >
              <option value="discount">Subscription discount</option>
              <option value="reward">Reward only</option>
              <option value="bundle">Discount + points bundle</option>
            </select>
          </label>

          <label>
            <span className={label}>Purpose</span>
            <select
              className={field}
              value={form.purpose}
              onChange={(event) =>
                set('purpose', event.target.value as PromoPurpose)
              }
            >
              {purposes.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className={label}>Starts *</span>
            <input
              className={field}
              type="date"
              value={form.startDate}
              onChange={(event) =>
                set('startDate', event.target.value)
              }
              required
            />
          </label>

          <label>
            <span className={label}>Ends *</span>
            <input
              className={field}
              type="date"
              value={form.endDate}
              onChange={(event) =>
                set('endDate', event.target.value)
              }
              min={form.startDate || undefined}
              required
            />
          </label>

          <label className="sm:col-span-2 lg:col-span-4">
            <span className={label}>Description</span>
            <textarea
              className="min-h-16 w-full resize-y rounded-md border bg-background px-2 py-1.5 text-xs"
              value={form.description}
              onChange={(event) =>
                set('description', event.target.value)
              }
              maxLength={1000}
            />
          </label>
        </div>
      </section>

      {showDiscount && (
        <section className={section}>
          <h2 className="text-sm font-semibold">
            Discount configuration
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className={label}>Discount type</span>
              <select
                className={field}
                value={form.discountType}
                onChange={(event) =>
                  set(
                    'discountType',
                    event.target.value as PromoDiscountType,
                  )
                }
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed amount</option>
              </select>
            </label>

            <label>
              <span className={label}>
                {form.discountType === 'percentage'
                  ? 'Discount (%) *'
                  : 'Discount amount *'}
              </span>
              <input
                className={field}
                type="number"
                min="0.01"
                max={
                  form.discountType === 'percentage'
                    ? 100
                    : undefined
                }
                step="0.01"
                value={form.discountValue}
                onChange={(event) =>
                  set('discountValue', event.target.value)
                }
                required
              />
            </label>

            <label>
              <span className={label}>Minimum purchase</span>
              <input
                className={field}
                type="number"
                min="0"
                step="0.01"
                value={form.minPurchaseAmount}
                onChange={(event) =>
                  set('minPurchaseAmount', event.target.value)
                }
              />
            </label>

            <label>
              <span className={label}>Maximum discount</span>
              <input
                className={field}
                type="number"
                min="0"
                step="0.01"
                value={form.maxDiscountAmount}
                onChange={(event) =>
                  set('maxDiscountAmount', event.target.value)
                }
              />
            </label>

            {needsCurrency && (
              <label>
                <span className={label}>
                  Currency for amounts *
                </span>
                <select
                  className={field}
                  value={form.amountCurrency}
                  onChange={(event) =>
                    set(
                      'amountCurrency',
                      event.target.value as PromoCurrency,
                    )
                  }
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            )}

            <div className="sm:col-span-2 lg:col-span-3">
              <span className={label}>
                Eligible subscription plans *
              </span>

              <div className="flex flex-wrap gap-3 pt-1">
                {plans.map((plan) => (
                  <label
                    key={plan}
                    className="flex items-center gap-1.5 text-xs capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={form.eligiblePlans.includes(plan)}
                      onChange={() => togglePlan(plan)}
                    />
                    {plan}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {showReward && (
        <section className={section}>
          <h2 className="text-sm font-semibold">Non-cash reward</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className={label}>Reward type</span>
              <select
                className={field}
                value={form.rewardType}
                onChange={(event) =>
                  set(
                    'rewardType',
                    event.target.value as PromoRewardType,
                  )
                }
              >
                <option value="bet_lab_points">Bet Lab points</option>
                <option value="subscription">Subscription access</option>
              </select>
            </label>

            {form.rewardType === 'bet_lab_points' ? (
              <label>
                <span className={label}>Points amount *</span>
                <input
                  className={field}
                  type="number"
                  min="1"
                  step="1"
                  value={form.pointsAmount}
                  onChange={(event) =>
                    set('pointsAmount', event.target.value)
                  }
                  required
                />
              </label>
            ) : (
              <>
                <label>
                  <span className={label}>Reward plan</span>
                  <select
                    className={field}
                    value={form.rewardPlan}
                    onChange={(event) =>
                      set(
                        'rewardPlan',
                        event.target.value as PromoPlan,
                      )
                    }
                  >
                    {plans.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className={label}>Duration (days)</span>
                  <input
                    className={field}
                    type="number"
                    min="1"
                    max="365"
                    value={form.rewardDurationDays}
                    onChange={(event) =>
                      set('rewardDurationDays', event.target.value)
                    }
                  />
                </label>
              </>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Cash rewards are not supported. Points are granted after
            the qualifying payment is approved.
          </p>
        </section>
      )}

      {isReferral && (
        <section className={section}>
          <h2 className="text-sm font-semibold">
            Referral qualification
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className={label}>Requirement</span>
              <select
                className={field}
                value={form.requirement}
                onChange={(event) =>
                  set('requirement', event.target.value)
                }
              >
                <option value="register">Registration</option>
                <option value="regular_subscription">
                  Regular subscription
                </option>
                <option value="vip_subscription">
                  VIP subscription
                </option>
                <option value="premium_subscription">
                  Premium subscription
                </option>
                <option value="any_subscription">
                  Any subscription
                </option>
              </select>
            </label>

            <label>
              <span className={label}>
                Target qualifying referrals
              </span>
              <input
                className={field}
                type="number"
                min="1"
                value={form.targetCount}
                onChange={(event) =>
                  set('targetCount', event.target.value)
                }
              />
            </label>

            <label>
              <span className={label}>Maximum reward claims</span>
              <input
                className={field}
                type="number"
                min="0"
                value={form.maxClaims}
                onChange={(event) =>
                  set('maxClaims', event.target.value)
                }
              />
            </label>
          </div>
        </section>
      )}

      <section className={section}>
        <h2 className="text-sm font-semibold">
          Eligibility and redemption limits
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className={label}>
              Redemptions per user (0 = unlimited)
            </span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.perUserRedemptionLimit}
              onChange={(event) =>
                set('perUserRedemptionLimit', event.target.value)
              }
            />
          </label>

          <label>
            <span className={label}>
              Total redemptions (blank = unlimited)
            </span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.totalRedemptionLimit}
              onChange={(event) =>
                set('totalRedemptionLimit', event.target.value)
              }
            />
          </label>

          <label>
            <span className={label}>Account age unit</span>
            <select
              className={field}
              value={form.accountAgeUnit}
              onChange={(event) =>
                set(
                  'accountAgeUnit',
                  event.target.value as FormState['accountAgeUnit'],
                )
              }
            >
              <option value="days">Days</option>
              <option value="months">Calendar months</option>
              <option value="years">Years</option>
            </select>
          </label>

          <label>
            <span className={label}>Verification</span>
            <select
              className={field}
              value={form.verificationStatus}
              onChange={(event) =>
                set(
                  'verificationStatus',
                  event.target.value as FormState['verificationStatus'],
                )
              }
            >
              <option value="any">Any</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>
          </label>

          <label>
            <span className={label}>Minimum account age</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.accountAgeMin}
              onChange={(event) =>
                set('accountAgeMin', event.target.value)
              }
            />
          </label>

          <label>
            <span className={label}>Maximum account age</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.accountAgeMax}
              onChange={(event) =>
                set('accountAgeMax', event.target.value)
              }
            />
          </label>

          <label>
            <span className={label}>Subscription status</span>
            <select
              className={field}
              value={form.subscriptionStatus}
              onChange={(event) =>
                set(
                  'subscriptionStatus',
                  event.target.value as FormState['subscriptionStatus'],
                )
              }
            >
              <option value="any">Any</option>
              <option value="never_subscribed">
                Never subscribed
              </option>
              <option value="active">Active subscription</option>
              <option value="renewal_due">Renewal due</option>
              <option value="expired">Expired subscription</option>
            </select>
          </label>

          <label>
            <span className={label}>Previous plan</span>
            <select
              className={field}
              value={form.previousPlan}
              onChange={(event) =>
                set(
                  'previousPlan',
                  event.target.value as FormState['previousPlan'],
                )
              }
            >
              <option value="any">Any plan</option>
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className={label}>Days since expiry — min</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.expiryDaysMin}
              onChange={(event) =>
                set('expiryDaysMin', event.target.value)
              }
            />
          </label>

          <label>
            <span className={label}>Days since expiry — max</span>
            <input
              className={field}
              type="number"
              min="0"
              value={form.expiryDaysMax}
              onChange={(event) =>
                set('expiryDaysMax', event.target.value)
              }
            />
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-xs">
            <input
              type="checkbox"
              checked={form.firstPurchaseOnly}
              onChange={(event) =>
                set('firstPurchaseOnly', event.target.checked)
              }
            />
            First approved purchase only
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-[11px] text-muted-foreground">
          Discounts are recalculated by the backend against the target
          plan and payment currency. Client-side values are configuration
          only, not authoritative pricing.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/promos')}
            className="h-8 rounded-md border px-3 text-xs"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            type="submit"
            className="h-8 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving
              ? 'Saving…'
              : promo
                ? 'Save changes'
                : 'Create campaign'}
          </button>
        </div>
      </div>
    </form>
  );
}