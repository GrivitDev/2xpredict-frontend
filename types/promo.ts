export type PromoCampaignType =
  | 'direct'
  | 'referral';


export type PromoRequirement =
  | 'register'
  | 'regular_subscription'
  | 'vip_subscription'
  | 'any_subscription'
  | 'prediction_purchase';


export type RewardType =
  | 'subscription'
  | 'cash';


export type RewardPlan =
  | 'regular'
  | 'vip';



export interface Promo {

  _id:string;


  // ======================
  // BASIC INFO
  // ======================

  name:string;

  description?:string;



  // ======================
  // PROMO CODE
  // ======================

  promoCode?:string;

  registrationUrl?:string;



  // ======================
  // CAMPAIGN
  // ======================

  campaignType:PromoCampaignType;


  isActive:boolean;



  // ======================
  // DURATION
  // ======================

  startDate:string;

  endDate:string;



  // ======================
  // REQUIREMENT
  // ======================

  requirement:PromoRequirement;


  targetCount:number;



  // ======================
  // CLAIM SETTINGS
  // ======================

  maxClaims:number;



  // ======================
  // REWARD
  // ======================

  rewardType:RewardType;


  rewardPlan?:RewardPlan;


  rewardDurationDays?:number;


  rewardAmount?:number;



  // ======================
  // TIMESTAMPS
  // ======================

  createdAt:string;

  updatedAt:string;
}





// ==============================
// CREATE PROMO PAYLOAD
// ==============================

export interface CreatePromoPayload {

  name:string;

  description?:string;


  campaignType:PromoCampaignType;


  startDate:string;

  endDate:string;


  requirement:PromoRequirement;


  targetCount:number;


  maxClaims:number;


  rewardType:RewardType;


  rewardPlan?:RewardPlan;


  rewardDurationDays?:number;


  rewardAmount?:number;
}





// ==============================
// UPDATE PROMO PAYLOAD
// ==============================

export type UpdatePromoPayload =
  Partial<CreatePromoPayload> & {

    isActive?:boolean;

  };

  export interface PromoReward {


  _id:string;


  userId:{
    _id:string;

    username:string;

    email:string;
  };


  claimNumber:number;


  type:
    | 'subscription'
    | 'cash';



  plan?: 
    | 'regular'
    | 'vip';



  durationDays?:number;


  amount?:number;


  status:
    | 'pending'
    | 'approved'
    | 'paid';


  createdAt:string;

}

// ==============================
// USER PROMO PROGRESS
// ==============================

export interface PromoProgress {

  promoId:string;


  name:string;

  description?:string;



  campaignType:PromoCampaignType;


  requirement:PromoRequirement;



  targetCount:number;



  currentProgress:number;


  qualifiedReferrals:number;


  remainingToNextReward:number;



  rewardType:RewardType;


  rewardPlan?:RewardPlan;


  rewardDurationDays?:number;


  rewardAmount?:number;



  completedClaims:number;


  completed:boolean;

}