import type { IdRecord } from './common';

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

export interface PlanLabels {
  free: string;
  regular: string;
  vip: string;
  premium: string;
}

export interface PlanConfig extends IdRecord {
  regularPrice: number;
  vipPrice: number;
  premiumPrice: number;
  regularPriceUSD: number;
  vipPriceUSD: number;
  premiumPriceUSD: number;
  bankDetails: BankDetails;
  bankDetailsUSD: BankDetails;
  subscriptionDurationDays: 30;
  planLabels: PlanLabels;
}

/** Only fields whitelisted by PlanConfigService.update are accepted. */
export type PlanConfigUpdate = Partial<Pick<
  PlanConfig,
  | 'regularPrice'
  | 'vipPrice'
  | 'premiumPrice'
  | 'regularPriceUSD'
  | 'vipPriceUSD'
  | 'premiumPriceUSD'
>> & {
  bankDetails?: Partial<BankDetails>;
  bankDetailsUSD?: Partial<BankDetails>;
  planLabels?: Partial<PlanLabels>;
  subscriptionDurationDays?: 30;
};
