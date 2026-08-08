import { AdAction } from './ad';
import { AdDisplay } from './ad';
import { AdImage } from './ad';

export interface InternalAd {
  _id: string;

  title: string;

  subTitle?: string;

  description?: string;

  instructions: string[];

  image?: AdImage;

  actions: AdAction[];

  displays: AdDisplay[];

  priority: number;

  isActive: boolean;

  impressions: number;

  clicks: number;

  startDate?: string;

  endDate?: string;

  createdAt: string;

  updatedAt: string;
}