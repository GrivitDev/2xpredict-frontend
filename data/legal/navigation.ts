import { TERMS_OF_USE_SECTIONS } from '@/lib/terms-of-use-sections';

type LegalNavigationItem = {
  id: string;
  title: string;
};

type LegalNavigationDocument = {
  title: string;
  href: string;
  items: LegalNavigationItem[];
};

/** Shared section navigation for the legacy legal content layout. */
export const legalNavigation: LegalNavigationDocument[] = [
  {
    title: 'Terms of Use',
    href: '/terms-of-use',
    items: TERMS_OF_USE_SECTIONS.map(({ id, title }) => ({ id, title })),
  },
  {
    title: 'Privacy Policy',
    href: '/privacy-policy',
    items: [
      { id: 'who-we-are', title: 'Who We Are' },
      { id: 'information-we-collect', title: 'Information We Collect' },
      { id: 'google-sign-in', title: 'Google Sign-In and Google User Data' },
      { id: 'how-we-use-information', title: 'How We Use Information' },
      { id: 'sharing-information', title: 'When Information May Be Shared' },
      { id: 'storage-and-security', title: 'Storage and Security' },
      { id: 'retention-and-deletion', title: 'Data Retention and Deletion' },
      { id: 'your-choices', title: 'Your Choices and Account Controls' },
      { id: 'third-party-services', title: 'Third-Party Services and Links' },
      { id: 'children', title: 'Age and Eligibility' },
      { id: 'changes', title: 'Changes to This Policy' },
      { id: 'contact', title: 'Contact and Privacy Requests' },
    ],
  },
];
