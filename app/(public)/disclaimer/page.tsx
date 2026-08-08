import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  disclaimerContent,
  disclaimerToc,
} from '@/data/legal/disclaimer';


export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Understand the limitations, responsibilities, and conditions related to using our Football Prediction Platform.',
};


export default function DisclaimerPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Disclaimer"
          description="
            Important information about football predictions,
            platform services, user responsibility, and the
            limitations of our services.
          "
          lastUpdated="9 July 2026"
          readingTime="9 min"
        />


        <LegalContentLayout
          title="Disclaimer"
        >

          {disclaimerContent}

        </LegalContentLayout>


        <LegalFooterNavigation

          previous={{
            title: 'Cookie Policy',
            href: '/cookie-policy',
          }}

          next={{
            title: 'Responsible Gambling',
            href: '/responsible-gambling',
          }}

        />

      </LegalContainer>
    </>
  );
}