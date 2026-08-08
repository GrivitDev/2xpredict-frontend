import {
  DollarSign,
  Crown,
  CreditCard,
  Target,
} from 'lucide-react';


import AnalyticsCard
from './AnalyticsCard';



import {
  AnalyticsRevenue,
} from '@/types/analytics.types';



interface Props {

 revenue: AnalyticsRevenue;

}



export default function RevenueSection({
 revenue,
}:Props){


const cards=[

{
 title:'Total Revenue',
 value:`₦${revenue.totalRevenue.toLocaleString()}`,
 description:'Approved payments',
 icon:DollarSign,
 highlight:true,
},


{
 title:'VIP Revenue',
 value:`₦${revenue.vipRevenue.toLocaleString()}`,
 description:'VIP subscriptions',
 icon:Crown,
 highlight:true,
},


{
 title:'Regular Revenue',
 value:`₦${revenue.regularRevenue.toLocaleString()}`,
 description:'Regular subscriptions',
 icon:CreditCard,
},


{
 title:'Prediction Revenue',
 value:`₦${revenue.predictionRevenue.toLocaleString()}`,
 description:'Prediction purchases',
 icon:Target,
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

Revenue Analytics

</h2>


<p
className="
text-sm
text-muted-foreground
"
>

Payment performance overview

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