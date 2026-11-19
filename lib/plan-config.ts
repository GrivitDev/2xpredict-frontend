import { planConfigService } from '@/services/plan-config.service';
import type { PlanConfig } from '@/types/plan-config';

/** Compatibility helper; new UI components should use usePlanConfigQuery. */
export async function getPlanConfig(): Promise<PlanConfig> {
  return planConfigService.get();
}
