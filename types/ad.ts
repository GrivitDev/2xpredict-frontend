import { AdPage,} from '@/constants/ads/ad-page';
import { AdDevice,} from '@/constants/ads/ad-device';
import { AdTrigger,} from '@/constants/ads/ad-trigger';
import { AdPosition,} from '@/constants/ads/ad-position';
import { AdAudience } from '@/constants/ads/ad-audience';



export interface AdImage {

  url:string;

  publicId:string;

  width:number;

  height:number;

  format:string;

  bytes:number;

}



export interface AdAction {

  label:string;

  url:string;

}



export interface AdDisplay {

  page:AdPage;

  position:AdPosition;

  device:AdDevice;

  trigger:AdTrigger;

  fixed:boolean;

  displayOrder:number;

}



export interface AdminAd {

  _id:string;

  title:string;

  subTitle?:string;

  description?:string;

  instructions:string[];
  
  audience: AdAudience;
  
  image:AdImage;

  actions:AdAction[];

  displays:AdDisplay[];

  priority:number;

  isActive:boolean;

  startDate?:string;

  endDate?:string;

  impressions:number;

  clicks:number;

  createdBy?:{
    _id:string;
    fullName:string;
    email:string;
  };

  createdAt:string;

  updatedAt:string;

}



export interface CreateAdPayload {

  title:string;

  subTitle?:string;

  description?:string;

  instructions:string[];

  image:AdImage;

  audience: AdAudience;

  actions:AdAction[];

  displays:AdDisplay[];

  priority:number;

  isActive:boolean;

  startDate?:string;

  endDate?:string;

}



export type UpdateAdPayload =
Partial<CreateAdPayload>;

export interface AdAnalytics {

  totalAds:number;

  activeAds:number;

  impressions:number;

  clicks:number;

  ctr:number;

}

export { AdPage, AdPosition };
