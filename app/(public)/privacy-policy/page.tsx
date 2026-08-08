import type { Metadata } from 'next';

import {
  LegalContainer,
  LegalHero,
  LegalContentLayout,
  LegalFooterNavigation,
  LegalReadingProgress,
} from '@/components/legal';

import {
  privacyContent,
  privacyToc,
} from '@/data/legal/privacy';


export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how our Football Prediction Platform collects, uses, and protects your personal information.',
};


export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalReadingProgress />

      <LegalContainer>

        <LegalHero
          title="Privacy Policy"
          description="
            Learn how we collect, use, protect, and manage your personal
            information when you use our Football Prediction Platform.
          "
          lastUpdated="9 July 2026"
          readingTime="10 min"
        />


        <LegalContentLayout
          title="Privacy Policy"
        >

          {privacyContent}

        </LegalContentLayout>


        <LegalFooterNavigation
          next={{
            title: 'Terms & Conditions',
            href: '/terms-and-conditions',
          }}
        />

      </LegalContainer>
    </>
  );
}