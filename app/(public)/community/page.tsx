import { CommunityAds } from '@/components/ads/ExtAds/positions/CommunityAds';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import CommunityPage from '@/components/community/CommunityPage';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';


export default function CommunityRoute() {

  return (

    <>
    <CommunityPage />

    <CommunityAds />

    
    <InternalAds
      page={AdPage.HOME}
      position={AdPosition.POPUP} />
      </>

  );

}