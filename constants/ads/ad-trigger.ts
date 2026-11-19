import type { AdTrigger as AdTriggerValue } from '@/types/ads';
export const AdTrigger = { ALWAYS:'ALWAYS', EVERY_VISIT:'EVERY_VISIT', FIRST_VISIT:'FIRST_VISIT', ON_LOGIN:'ON_LOGIN', ON_REFRESH:'ON_REFRESH', ONCE_PER_SESSION:'ONCE_PER_SESSION', ONCE_PER_DAY:'ONCE_PER_DAY' } as const satisfies Record<string, AdTriggerValue>;
export type { AdTrigger as AdTriggerType } from '@/types/ads';

