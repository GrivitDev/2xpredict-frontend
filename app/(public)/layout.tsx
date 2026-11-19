import CookieConsent from '@/components/CookieConsent';
import PublicAdRuntime from '@/components/ads/PublicAdRuntime';

/** Route-specific content only. Site chrome is rendered once by the root AppShell. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicAdRuntime region="top" />
      {children}
      <PublicAdRuntime region="bottom" />
      <CookieConsent />
    </>
  );
}
