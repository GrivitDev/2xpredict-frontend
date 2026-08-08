import {
CreditCard,
Crown,
Users,
CheckCircle,
} from 'lucide-react';


import AnalyticsCard
from './AnalyticsCard';


import {
AnalyticsSubscriptions,
} from '@/types/analytics.types';



interface Props{

subscriptions:
AnalyticsSubscriptions;

}



export default function SubscriptionSection({
subscriptions,
}:Props){


const cards=[


{
title:'Active Subscriptions',
value:subscriptions.activeSubscriptions,
description:'Currently active plans',
icon:CheckCircle,
highlight:true,
},


{
title:'VIP Members',
value:subscriptions.activeVipSubscriptions,
description:'Active VIP users',
icon:Crown,
highlight:true,
},


{
title:'Regular Members',
value:subscriptions.activeRegularSubscriptions,
description:'Active regular users',
icon:Users,
},


{
title:'All Subscriptions',
value:subscriptions.totalSubscriptions,
description:'Lifetime subscriptions',
icon:CreditCard,
},


];



return (

<section
className="
space-y-4
"
>


<div>

<h2
className="
text-xl
font-semibold
"
>

Subscription Analytics

</h2>


<p
className="
text-sm
text-muted-foreground
"
>

Membership growth overview

</p>


</div>



<div
className="
grid
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


</section>

);


}