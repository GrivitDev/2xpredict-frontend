import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import PricingSection from '@/components/pricing/PricingSection';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';


export default function PricingPage() {
  return (
    <main className="min-h-screen">

      <PricingSection />
<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>
    </main>
  );
}