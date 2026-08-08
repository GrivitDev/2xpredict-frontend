'use client';


import {
  useQuery,
} from '@tanstack/react-query';


import {
  getAnalyticsDashboard,
} from '@/services/admin-analytics.service';


import AnalyticsHeader
from '@/components/admin/dashboard/AnalyticsHeader';


import AnalyticsOverview
from '@/components/admin/dashboard/AnalyticsOverview';


import RevenueSection
from '@/components/admin/dashboard/RevenueSection';


import SubscriptionSection
from '@/components/admin/dashboard/SubscriptionSection';


import PredictionSection
from '@/components/admin/dashboard/PredictionSection';


import MarketingSection
from '@/components/admin/dashboard/MarketingSection';


import ReferralSection
from '@/components/admin/dashboard/ReferralSection';


import LeaderboardSection
from '@/components/admin/dashboard/LeaderboardSection';


import DashboardSkeleton
from '@/components/admin/dashboard/DashboardSkeleton';



export default function AdminDashboardPage(){


const {
 data,
 isLoading,
}=useQuery({

 queryKey:[
  'admin-analytics-dashboard'
 ],

 queryFn:
 getAnalyticsDashboard,

});



if(isLoading){

 return (
  <DashboardSkeleton/>
 );

}



if(!data){

 return null;

}



return (

<div
  className="
    relative
    min-w-0
    max-w-full
    space-y-8
    overflow-x-hidden
  "
>


<AnalyticsHeader
 data={data}
/>



<AnalyticsOverview
 users={data.users}
 revenue={data.revenue}
 subscriptions={data.subscriptions}
 predictions={data.predictions}
/>



<RevenueSection
 revenue={data.revenue}
/>



<SubscriptionSection
 subscriptions={data.subscriptions}
/>



<PredictionSection
 predictions={data.predictions}
/>



<MarketingSection
 ads={data.ads}
 promos={data.promos}
/>



<ReferralSection
 referrals={data.referrals}
/>



<LeaderboardSection
 leaderboards={data.leaderboards}
/>



</div>

);


}