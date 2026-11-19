import type { AdAudience as AdAudienceValue } from '@/types/ads';
export const AdAudience = { ALL:'ALL', GUEST:'GUEST', FREE:'FREE', REGULAR:'REGULAR', VIP:'VIP', PREMIUM:'PREMIUM' } as const satisfies Record<string, AdAudienceValue>;
export type { AdAudience as AdAudienceType } from '@/types/ads';

