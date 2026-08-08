import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  termsContent,
} from '@/data/legal/terms';


export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Read the terms and conditions that govern the use of our Football Prediction Platform, subscriptions, predictions, and services.',
};


export default function TermsAndConditionsPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Terms and Conditions"
          description="
            Understand the rules, responsibilities, and conditions
            that apply when using our Football Prediction Platform,
            subscriptions, and premium services.
          "
          lastUpdated="9 July 2026"
          readingTime="12 min"
        />


        <LegalContentLayout
          title="Terms and Conditions"
        >

          {termsContent}

        </LegalContentLayout>


        <LegalFooterNavigation
          previous={{
            title: 'Privacy Policy',
            href: '/privacy-policy',
          }}
          next={{
            title: 'Cookie Policy',
            href: '/cookie-policy',
          }}
        />


      </LegalContainer>
    </>
  );
}