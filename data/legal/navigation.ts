import {
  privacyToc,
} from './privacy';

import {
  termsToc,
} from './terms';

import {
  cookiesToc,
} from './cookies';

import {
  disclaimerToc,
} from './disclaimer';

import {
  refundPolicyToc,
} from './refund-policy';

import {
  responsibleGamblingToc,
} from './responsible-gambling';

import {
  advertisingPolicyToc,
} from './advertising-policy';

import { ownershipToc } from './ownership';



export const legalNavigation = [

  {
    title: 'Ownership Information',
    href: '/ownership',
    items: ownershipToc,
  },

  {
    title: 'Privacy Policy',
    href: '/privacy-policy',
    items: privacyToc,
  },


  {
    title: 'Terms & Conditions',
    href: '/terms-and-conditions',
    items: termsToc,
  },


  {
    title: 'Cookie Policy',
    href: '/cookie-policy',
    items: cookiesToc,
  },


  {
    title: 'Disclaimer',
    href: '/disclaimer',
    items: disclaimerToc,
  },


  {
    title: 'Responsible Gambling',
    href: '/responsible-gambling',
    items: responsibleGamblingToc,
  },


  {
    title: 'Refund Policy',
    href: '/refund-policy',
    items: refundPolicyToc,
  },


  {
    title: 'Advertising Policy',
    href: '/advertising-policy',
    items: advertisingPolicyToc,
  },

];