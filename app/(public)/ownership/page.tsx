import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  ownershipContent,
} from '@/data/legal/ownership';


export const metadata: Metadata = {
  title: 'Ownership Information',
  description:
    'Learn who owns, operates, and developed our Football Prediction Platform, including our purpose and mission.',
};


export default function OwnershipInformationPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Ownership Information"
          description="
            Learn who owns, operates, and developed our
            Football Prediction Platform, as well as the
            purpose behind its creation.
          "
          lastUpdated="29 July 2026"
          readingTime="2 min"
        />


        <LegalContentLayout
          title="Ownership Information"
        >

          {ownershipContent}

        </LegalContentLayout>


        <LegalFooterNavigation
          previous={{
            title: 'Disclaimer',
            href: '/disclaimer',
          }}
          next={{
            title: 'Privacy Policy',
            href: '/privacy-policy',
          }}
        />


      </LegalContainer>
    </>
  );
}