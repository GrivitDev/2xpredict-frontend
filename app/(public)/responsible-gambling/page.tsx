import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  responsibleGamblingContent,
} from '@/data/legal/responsible-gambling';


export const metadata: Metadata = {
  title: 'Responsible Gambling',
  description:
    'Learn about responsible use of our Football Prediction Platform and how to maintain a balanced approach when using our services.',
};


export default function ResponsibleGamblingPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Responsible Gambling"
          description="
            Guidelines for using football prediction services
            responsibly, understanding risks, and maintaining
            healthy decision-making.
          "
          lastUpdated="9 July 2026"
          readingTime="8 min"
        />


        <LegalContentLayout
          title="Responsible Gambling"
        >

          {responsibleGamblingContent}

        </LegalContentLayout>


        <LegalFooterNavigation

          previous={{
            title: 'Disclaimer',
            href: '/disclaimer',
          }}

          next={{
            title: 'Refund Policy',
            href: '/refund-policy',
          }}

        />

      </LegalContainer>
    </>
  );
}