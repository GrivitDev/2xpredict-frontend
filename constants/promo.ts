import {
  PromoCampaignType,
  PromoRequirement,
  RewardPlan,
  RewardType,
} from '@/types/promo';


// =====================================
// CAMPAIGN TYPES
// =====================================

export const PROMO_CAMPAIGN_OPTIONS: {
  label:string;
  value:PromoCampaignType;
}[] = [

  {
    label:'Direct Campaign',
    value:'direct',
  },

  {
    label:'Referral Campaign',
    value:'referral',
  },

];



// =====================================
// PROMO REQUIREMENTS
// =====================================

export const PROMO_REQUIREMENT_OPTIONS: {
  label:string;
  value:PromoRequirement;
}[] = [

  {
    label:'User Registration',
    value:'register',
  },

  {
    label:'Regular Subscription',
    value:'regular_subscription',
  },

  {
    label:'VIP Subscription',
    value:'vip_subscription',
  },

  {
    label:'Any Subscription',
    value:'any_subscription',
  },

  {
    label:'Prediction Purchase',
    value:'prediction_purchase',
  },

];



// =====================================
// REWARD TYPES
// =====================================

export const REWARD_TYPE_OPTIONS: {
  label:string;
  value:RewardType;
}[] = [

  {
    label:'Subscription Reward',
    value:'subscription',
  },

  {
    label:'Cash Reward',
    value:'cash',
  },

];



// =====================================
// SUBSCRIPTION REWARD PLANS
// =====================================

export const REWARD_PLAN_OPTIONS: {
  label:string;
  value:RewardPlan;
}[] = [

  {
    label:'Regular Plan',
    value:'regular',
  },

  {
    label:'VIP Plan',
    value:'vip',
  },

];



// =====================================
// CLAIM OPTIONS
// =====================================

export const CLAIM_OPTIONS = [

  {
    label:'One Time Claim',
    value:1,
  },

  {
    label:'3 Claims',
    value:3,
  },

  {
    label:'5 Claims',
    value:5,
  },

  {
    label:'Unlimited Claims',
    value:0,
  },

];



// =====================================
// DISPLAY HELPERS
// =====================================

export const PROMO_CAMPAIGN_LABELS = {

  direct:'Direct',

  referral:'Referral',

};



export const PROMO_REQUIREMENT_LABELS = {

  register:'Registration',

  regular_subscription:'Regular Subscription',

  vip_subscription:'VIP Subscription',

  any_subscription:'Any Subscription',

  prediction_purchase:'Prediction Purchase',

};



export const REWARD_TYPE_LABELS = {

  subscription:'Subscription',

  cash:'Cash',

};