import { asRecord, unwrapRecord } from '@/lib/api-shapes';
import type { PredictionAccessPlan } from '@/types/predictions';

export type PredictionSlipProductId =
  | 'ODDS_10'
  | 'ODDS_25'
  | 'ODDS_50'
  | 'SURE_2'
  | 'SURE_5'
  | 'SURE_7';

const PLAN_ORDER: readonly PredictionAccessPlan[] = [
  'anonymous', 'free', 'regular', 'vip', 'premium',
];

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === 'string');
}

/** The backend public policy is authoritative for a plan's active market allowlist. */
export function getVisiblePredictionMarketKeys(
  policyData: unknown,
  plan: PredictionAccessPlan,
): Set<string> | null {
  const root = unwrapRecord(policyData);
  const rules = asRecord(root.rules);
  const planRules = asRecord(rules[plan]);
  const marketAccess = asRecord(planRules.marketAccess);
  const activePickCenter = asRecord(planRules.activePickCenter);
  const activeMarketAccess = asRecord(activePickCenter.marketAccess);
  const fromRules = asStringArray(marketAccess.visibleMarketKeys)
    ?? asStringArray(activeMarketAccess.visibleMarketKeys);
  const marketVisibility = asRecord(root.marketVisibility);
  const fromConfig = asStringArray(asRecord(marketVisibility[plan]).marketKeys);
  const keys = fromRules ?? fromConfig;
  return keys
    ? new Set(keys.map((key) => key.trim().toUpperCase()).filter(Boolean))
    : null;
}

/** Resolve the minimum qualifying plan by reading the backend's policy arrays. */
export function getSlipProductRequiredPlan(
  policyData: unknown,
  product: PredictionSlipProductId,
): Exclude<PredictionAccessPlan, 'anonymous' | 'free'> | null {
  const rules = asRecord(unwrapRecord(policyData).rules);
  for (const plan of PLAN_ORDER) {
    if (plan === 'anonymous' || plan === 'free') continue;
    const planRules = asRecord(rules[plan]);
    const slipProducts = asStringArray(planRules.slipProducts) ?? [];
    const sureOdds = asStringArray(planRules.sureOdds) ?? [];
    if (slipProducts.includes(product) || sureOdds.includes(product)) return plan;
  }
  return null;
}

export function normalizePredictionPlan(value: unknown): PredictionAccessPlan | null {
  const normalized = String(value ?? '').trim().toLowerCase();
  return PLAN_ORDER.includes(normalized as PredictionAccessPlan)
    ? normalized as PredictionAccessPlan
    : null;
}

export function planMeetsPredictionRequirement(
  currentPlan: PredictionAccessPlan,
  requiredPlan: PredictionAccessPlan | null,
): boolean {
  if (!requiredPlan) return false;
  return PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}
