'use client';

import HeroSection from '@/components/home-sections/hero/HeroSection';
import FeaturesSection from '@/components/home-sections/features/FeaturesSection';
import ArticlesPreview from '@/components/home-sections/articles-preview';
import CommunityPreviewSection from '@/components/home-sections/community-preview/CommunityPreviewSection';
import PredictionPreview from '@/components/home-sections/PredictionsPreview';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';

import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { HomepageAds } from '@/components/ads/ExtAds/positions/HomepageAds';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden transition-colors duration-300 bg-background text-foreground">

      <HeroSection />      
        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.TOP_BANNER}
        />

<HomepageAds />
      <FeaturesSection />
              <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />
  <PredictionPreview />
      <ArticlesPreview />
            <InternalAds
  page={AdPage.HOME}
  position={AdPosition.INLINE}
/>
    <CommunityPreviewSection/>
      <InternalAds
  page={AdPage.HOME}
  position={AdPosition.BOTTOM}
/>

<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>
    </main>
  );
}