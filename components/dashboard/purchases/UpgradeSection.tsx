'use client';

import type { PlanConfig } from '@/types/plan-config';
import type { UpgradePriceResponse } from '@/services/subscription.service';

import UpgradeCard from './UpgradeCard';

type CurrentPlan =
  | 'free'
  | 'regular'
  | 'vip';

interface UpgradeSectionProps {
  plan: CurrentPlan;
  config: PlanConfig;
  upgradePrice?: UpgradePriceResponse | null;
  upgradeLoading?: boolean;
  onUpgrade: (
    target: 'regular' | 'vip',
  ) => void;
}

export default function UpgradeSection({
  plan,
  config,
  upgradePrice,
  upgradeLoading,
  onUpgrade,
}: UpgradeSectionProps) {
  return (
    <UpgradeCard
      currentPlan={plan}
      config={config}
      upgradePrice={upgradePrice}
      upgradeLoading={upgradeLoading}
      onUpgrade={onUpgrade}
    />
  );
}