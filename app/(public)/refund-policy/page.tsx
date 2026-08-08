import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  refundPolicyContent,
  refundPolicyToc,
} from '@/data/legal/refund-policy';


export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Understand our refund conditions, payment rules, subscription policies, and situations where refunds may be considered.',
};


export default function RefundPolicyPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Refund Policy"
          description="
            Learn about payment conditions, subscription
            refunds, eligible refund situations, and how
            payment issues are handled.
          "
          lastUpdated="9 July 2026"
          readingTime="8 min"
        />


        <LegalContentLayout
          title="Refund Policy"
        >

          {refundPolicyContent}

        </LegalContentLayout>


        <LegalFooterNavigation

          previous={{
            title: 'Responsible Gambling',
            href: '/responsible-gambling',
          }}

          next={{
            title: 'Advertising Policy',
            href: '/advertising-policy',
          }}

        />

      </LegalContainer>
    </>
  );
}