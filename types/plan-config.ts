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
}

export interface PlanConfig {
  // Nigeria
  regularPrice: number;
  vipPrice: number;
  bankDetails: BankDetails;

  // International
  regularPriceUSD: number;
  vipPriceUSD: number;
  bankDetailsUSD: BankDetails;

  // Common
  subscriptionDurationDays: number;
  planLabels: PlanLabels;
}