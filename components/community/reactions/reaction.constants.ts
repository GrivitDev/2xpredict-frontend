'use client';


import {
  Flame,
  BadgeCheck,
  ThumbsUp,
  Scale,
  ThumbsDown,
  Annoyed,
} from 'lucide-react';



export type CommunityReactionType =

  | 'strongly_agree'

  | 'agree'

  | 'slightly_agree'

  | 'slightly_disagree'

  | 'disagree'

  | 'strongly_disagree';





export interface CommunityReaction {

  id:CommunityReactionType;

  label:string;

  icon:any;

  weight:number;

  intensity:
    | 'high'
    | 'medium'
    | 'low';

}





export const communityReactions:CommunityReaction[] = [

  {
    id:'strongly_agree',

    label:'Strongly Agree',

    icon:Flame,

    weight:2,

    intensity:'high',
  },


  {
    id:'agree',

    label:'Agree',

    icon:BadgeCheck,

    weight:1,

    intensity:'medium',
  },


  {
    id:'slightly_agree',

    label:'Slightly Agree',

    icon:ThumbsUp,

    weight:0.5,

    intensity:'low',
  },


  {
    id:'slightly_disagree',

    label:'Slightly Disagree',

    icon:Scale,

    weight:-0.5,

    intensity:'low',
  },


  {
    id:'disagree',

    label:'Disagree',

    icon:ThumbsDown,

    weight:-1,

    intensity:'medium',
  },


  {
    id:'strongly_disagree',

    label:'Strongly Disagree',

    icon:Annoyed,

    weight:-2,

    intensity:'high',
  },

];





export const reactionAnimation = {

  high:{
    hover:{
      scale:1.2,
      rotate:5,
    },

    tap:{
      scale:0.85,
    },
  },


  medium:{
    hover:{
      scale:1.1,
    },

    tap:{
      scale:0.9,
    },
  },


  low:{
    hover:{
      scale:1.05,
    },

    tap:{
      scale:0.95,
    },
  },

};