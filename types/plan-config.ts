export interface PlanConfig {

  regularPrice: number;

  vipPrice: number;

  subscriptionDurationDays: number;


  bankDetails: {

    bankName: string;

    accountName: string;

    accountNumber: string;

    instructions: string;

  };


  planLabels: {

    free: string;

    regular: string;

    vip: string;

  };

}