'use client';

import { useState } from 'react';

import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { ExternalAds } from '@/components/ads/ExtAds/ExternalAds';

export default function DashboardLayout({
  children,
}:{
  children:React.ReactNode;
}){

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  return(

    <main
      className="
        relative
        flex
        h-screen
        overflow-hidden
        bg-background
        text-foreground
      "
    >

      <DashboardSidebar
        open={sidebarOpen}
        onClose={()=>
          setSidebarOpen(false)
        }
      />


      <section
        className="
          flex
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >

        <DashboardHeader
          onMenuClick={()=>
            setSidebarOpen(true)
          }
        />


        <div
          className="
            flex-1
            overflow-y-auto
            scrollbar-hide
          "
        >

          <div
            className="
              mx-auto
              w-full
              max-w-7xl
              p-4
              sm:p-6
              lg:p-8
            "
          >
<ExternalAds />
            {children}

          </div>

        </div>
      <InternalAds
  page={AdPage.HOME}
  position={AdPosition.FOOTER}
/>
      </section>


    </main>

  );

}