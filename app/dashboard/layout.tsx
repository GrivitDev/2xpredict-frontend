'use client';

import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer';
import CookieConsent from '@/components/CookieConsent';

import { NavbarProvider } from '@/components/navbar/NavbarContext';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';

import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';

import { ExternalAds } from '@/components/ads/ExtAds';


export default function DashboardLayout({
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
          overflow-x-clip
          bg-background
          text-foreground
        "
      >

        {/* ==================================================
            NAVBAR
            ================================================== */}

        <Navbar />


        {/* ==================================================
            MAIN
            ================================================== */}

        <main
          className="
            w-full
          "
        >




          {/* Dashboard content */}

          <div
            className="
              mx-auto
              w-full
              max-w-7xl
              px-3
              py-3

              sm:px-4
              sm:py-4

              lg:px-6
              lg:py-5
            "
          >

            {children}

          </div>
          {/* External advertising */}

          <ExternalAds />
        </main>


        {/* ==================================================
            COOKIE
            ================================================== */}

        <CookieConsent />


        {/* ==================================================
            FOOTER AD
            ================================================== */}

        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.FOOTER}
        />


        {/* ==================================================
            FOOTER
            ================================================== */}

        <Footer />

      </div>

    </NavbarProvider>

  );
}