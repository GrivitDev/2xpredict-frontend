export interface ReferralUser {
  _id: string;

  username: string;

  email: string;
}


export interface Referral {


  _id: string;


  referrerId: ReferralUser;


  referredUserId: ReferralUser;


  registered: boolean;


  regularSubscription: boolean;


  vipSubscription: boolean;


  predictionPurchased: boolean;


  rewardClaimed: boolean;


  rewardClaimedAt?: string;


  createdAt: string;


  updatedAt: string;

}



export interface ReferralAdminStats {


  total: number;


  totalReferrers: number;


  registered: number;


  regularSubscribers: number;


  vipSubscribers: number;


  predictionPurchases: number;


  conversionRate: number;

}