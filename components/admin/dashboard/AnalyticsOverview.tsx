import AnalyticsCard
from './AnalyticsCard';



import {
Users,
CreditCard,
Target,
TrendingUp,
} from 'lucide-react';



import {
AnalyticsUsers,
AnalyticsRevenue,
AnalyticsSubscriptions,
AnalyticsPredictions,
} from '@/types/analytics.types';



interface Props{

users:AnalyticsUsers;

revenue:AnalyticsRevenue;

subscriptions:AnalyticsSubscriptions;

predictions:AnalyticsPredictions;

}



export default function AnalyticsOverview({
users,
revenue,
subscriptions,
predictions,
}:Props){



const cards=[

{
title:'Total Users',
value:users.totalUsers,
icon:Users,
},

{
title:'Revenue',
value:`₦${revenue.totalRevenue}`,
icon:TrendingUp,
highlight:true,
},

{
title:'Subscriptions',
value:subscriptions.totalSubscriptions,
icon:CreditCard,
},

{
title:'Predictions',
value:predictions.totalPredictions,
icon:Target,
},


];



return (
<div className=" grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-5
"
>

{
cards.map(card=>(

<AnalyticsCard
key={card.title}
{...card}
/>

))
}


</div>

);


}