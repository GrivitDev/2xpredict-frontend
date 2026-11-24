import CookieConsent from '@/components/CookieConsent';
import PublicAdRuntime from '@/components/ads/PublicAdRuntime';
import Script from 'next/script';

/** Route-specific content only. Site chrome is rendered once by the root AppShell. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <PublicAdRuntime region="top" />
      {children}
      <PublicAdRuntime region="bottom" />
      <CookieConsent />
    </>
  );
}
