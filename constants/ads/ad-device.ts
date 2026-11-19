import type { AdDevice as AdDeviceValue } from '@/types/ads';
export const AdDevice = { ALL:'ALL', MOBILE:'MOBILE', TABLET:'TABLET', DESKTOP:'DESKTOP' } as const satisfies Record<string, AdDeviceValue>;
export type { AdDevice as AdDeviceType } from '@/types/ads';

