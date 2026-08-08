import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  advertisingPolicyContent,
} from '@/data/legal/advertising-policy';


export const metadata: Metadata = {
  title: 'Advertising Policy',
  description:
    'Learn how advertising works on our Football Prediction Platform, including advertising partners, cookies, sponsored content, and user choices.',
};


export default function AdvertisingPolicyPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Advertising Policy"
          description="
            Learn how advertisements support our platform,
            how advertising partners operate, and how we
            maintain independence in our football content.
          "
          lastUpdated="9 July 2026"
          readingTime="8 min"
        />


        <LegalContentLayout
          title="Advertising Policy"
        >

          {advertisingPolicyContent}

        </LegalContentLayout>


        <LegalFooterNavigation

          previous={{
            title: 'Refund Policy',
            href: '/refund-policy',
          }}

        />

      </LegalContainer>
    </>
  );
}