import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer';
import CookieConsent from '@/components/CookieConsent';
import { NavbarProvider } from '@/components/navbar/NavbarContext';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { ExternalAds } from '@/components/ads/ExtAds';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <NavbarProvider>
    <div
      className="
        min-h-screen
        w-full
        overflow-x-hidden
      "
    >

      <Navbar />

      <main
        className="
          w-full
        "
      >
        <ExternalAds />
        {children}
      </main>

      <CookieConsent />
      <InternalAds
  page={AdPage.HOME}
  position={AdPosition.FOOTER}
/>

      <Footer />

    </div>
    </NavbarProvider>
  );
}