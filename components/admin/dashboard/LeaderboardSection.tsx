'use client';

import {
  useState,
} from 'react';

import LeaderboardTable from './LeaderboardTable';

import {
  AnalyticsLeaderboards,
} from '@/types/analytics.types';


interface Props {
  leaderboards: AnalyticsLeaderboards;
}


type LeaderboardType =
  | 'subscribers'
  | 'vip'
  | 'regular'
  | 'buyers'
  | 'referrals';



export default function LeaderboardSection({
  leaderboards,
}: Props) {


const [
 activeLeaderboard,
 setActiveLeaderboard,
]=useState<LeaderboardType>('subscribers');



const tabs = [

{
 label:'Subscribers',
 value:'subscribers',
},

{
 label:'VIP',
 value:'vip',
},

{
 label:'Regular',
 value:'regular',
},

{
 label:'Buyers',
 value:'buyers',
},

{
 label:'Referrals',
 value:'referrals',
},

] as const;



const renderTable = () => {


switch(activeLeaderboard){


case 'vip':

return (

<LeaderboardTable
 title="Top VIP Subscribers"
 users={leaderboards.topVipSubscribers}
 metric="totalVipSubscriptions"
/>

);



case 'regular':

return (

<LeaderboardTable
 title="Top Regular Subscribers"
 users={leaderboards.topRegularSubscribers}
 metric="totalRegularSubscriptions"
/>

);



case 'buyers':

return (

<LeaderboardTable
 title="Top Prediction Buyers"
 users={leaderboards.topPredictionBuyers}
 metric="totalPurchases"
/>

);



case 'referrals':

return (

<LeaderboardTable
 title="Top Referrers"
 users={leaderboards.topReferrers}
 metric="successfulReferrals"
/>

);



default:

return (

<LeaderboardTable
 title="Top Subscribers"
 users={leaderboards.topSubscribers}
 metric="totalSubscriptions"
/>

);


}


};



return (

<section className="space-y-6">


<div>

<h2 className="text-xl font-semibold">
Leaderboards
</h2>

<p className="text-sm text-muted-foreground">
Highest-performing users across the platform
</p>

</div>



{/* Selector */}

<div
className="
flex
gap-2
rounded-lg
border
bg-muted/50
p-1
w-fit
"
>


{
tabs.map((tab)=>(

<button
key={tab.value}
onClick={()=>setActiveLeaderboard(tab.value)}
className={`
rounded-md
px-4
py-2
text-sm
font-medium
transition
${
activeLeaderboard === tab.value
? 'bg-background shadow'
: 'text-muted-foreground hover:text-foreground'
}
`}
>

{tab.label}

</button>

))

}


</div>



{/* Table */}

<div>

{renderTable()}

</div>



</section>

);

}