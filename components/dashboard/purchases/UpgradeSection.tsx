'use client';

import type { PlanConfig } from '@/types/plan-config';
import type { UpgradePriceResponse } from '@/services/subscription.service';
import type { PaymentCurrency } from '@/services/payment-gateway.service';

import UpgradeCard from './UpgradeCard';


type CurrentPlan =
  | 'free'
  | 'regular'
  | 'vip';


interface UpgradeSectionProps {
  plan: CurrentPlan;

  config: PlanConfig;

  currency: PaymentCurrency;

  upgradePrice?: UpgradePriceResponse | null;

  upgradeLoading?: boolean;

  onUpgrade: (
    target: 'regular' | 'vip',
  ) => void;
}


export default function UpgradeSection({
  plan,
  config,
  currency,
  upgradePrice,
  upgradeLoading = false,
  onUpgrade,
}: UpgradeSectionProps) {

  return (
    <UpgradeCard
      currentPlan={plan}
      config={config}
      currency={currency}
      upgradePrice={upgradePrice}
      upgradeLoading={upgradeLoading}
      onUpgrade={onUpgrade}
    />
  );
}