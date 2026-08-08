import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  cookiesContent,
} from '@/data/legal/cookies';


export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Learn how our Football Prediction Platform uses cookies and similar technologies to improve experience, security, analytics, and advertising services.',
};


export default function CookiePolicyPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Cookie Policy"
          description="
            Learn how cookies and similar technologies are
            used to improve platform functionality, security,
            analytics, and future advertising services.
          "
          lastUpdated="9 July 2026"
          readingTime="8 min"
        />


        <LegalContentLayout
          title="Cookie Policy"
        >

          {cookiesContent}

        </LegalContentLayout>


        <LegalFooterNavigation

          previous={{
            title: 'Terms & Conditions',
            href: '/terms-and-conditions',
          }}

          next={{
            title: 'Disclaimer',
            href: '/disclaimer',
          }}

        />


      </LegalContainer>
    </>
  );
}