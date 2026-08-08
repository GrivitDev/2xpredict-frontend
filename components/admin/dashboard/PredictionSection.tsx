import {
Target,
Crown,
Users,
CheckCircle,
XCircle,
ShieldAlert,
Clock,
} from 'lucide-react';



import AnalyticsCard
from './AnalyticsCard';



import {
AnalyticsPredictions,
} from '@/types/analytics.types';



interface Props{

predictions:
AnalyticsPredictions;

}



export default function PredictionSection({
predictions,
}:Props){



const cards=[


{
title:'Total Predictions',
value:predictions.totalPredictions,
icon:Target,
highlight:true,
},


{
title:'VIP Predictions',
value:predictions.vipPredictions,
icon:Crown,
},


{
title:'Regular Predictions',
value:predictions.regularPredictions,
icon:Users,
},


{
title:'Free Predictions',
value:predictions.freePredictions,
icon:Target,
},


{
title:'Won',
value:predictions.wonPredictions,
icon:CheckCircle,
highlight:true,
},


{
title:'Lost',
value:predictions.lostPredictions,
icon:XCircle,
},


{
title:'Void',
value:predictions.voidPredictions,
icon:ShieldAlert,
},


{
title:'Pending',
value:predictions.pendingPredictions,
icon:Clock,
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

Prediction Performance

</h2>


<p
className="
text-sm
text-muted-foreground
"
>

Prediction activity and success rate

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