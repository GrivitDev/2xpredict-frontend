'use client';


import {
 useQuery,
} from '@tanstack/react-query';


import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from '@/components/ui/card';


import {
 Badge,
} from '@/components/ui/badge';


import {
 getAllClaimedRewards,
} from '@/services/admin-promo-rewards.service';



export default function AdminClaimedRewardsTable(){


const {
 data:rewards=[],
 isLoading,
}=useQuery({

 queryKey:[
  'claimed-rewards'
 ],

 queryFn:getAllClaimedRewards

});



if(isLoading){

 return (
  <p>
   Loading rewards...
  </p>
 )

}



return (

<Card>


<CardHeader>

<CardTitle>

All Claimed Rewards

</CardTitle>

</CardHeader>


<CardContent>


<div className="overflow-x-auto">


<table className="w-full text-sm">


<thead>

<tr className="border-b">

<th className="p-3 text-left">
User
</th>


<th className="p-3">
Campaign
</th>


<th className="p-3">
Reward
</th>


<th className="p-3">
Claim
</th>


<th className="p-3">
Status
</th>


</tr>

</thead>



<tbody>


{
rewards.map(
(reward:any)=>(


<tr
key={reward._id}
className="border-b"
>


<td className="p-3">

<div>

<p className="font-medium">

{
reward.userId?.fullName ||
reward.userId?.username
}

</p>


<p className="text-muted-foreground">

{
reward.userId?.email
}

</p>


</div>

</td>

<td className="p-3">

{
reward.promoId?.campaignType

}

</td>                 





<td className="p-3">


{
reward.type==='subscription'

?

`${reward.plan} ${reward.durationDays} days`

:

`₦${reward.amount}`

}


</td>




<td className="p-3">

#
{reward.claimNumber}

</td>




<td className="p-3">


<Badge>

{
reward.status
}

</Badge>


</td>



</tr>


)
)
}



</tbody>


</table>


</div>


</CardContent>


</Card>


)

}