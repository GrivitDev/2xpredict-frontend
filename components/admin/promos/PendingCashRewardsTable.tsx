'use client';


import {
 useQuery,
 useMutation,
 useQueryClient,
} from '@tanstack/react-query';


import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from '@/components/ui/card';


import {
 Button,
} from '@/components/ui/button';


import {
 getPendingCashRewards,
} from '@/services/admin-promo-rewards.service';



import {
 markCashRewardPaid,
} from '@/services/admin-promo-rewards.service';



export default function PendingCashRewardsTable(){


const queryClient=useQueryClient();


const {
data:rewards=[],
}=useQuery({

queryKey:[
'pending-cash'
],

queryFn:getPendingCashRewards

});



const mutation=useMutation({

mutationFn:markCashRewardPaid,


onSuccess(){

queryClient.invalidateQueries({
queryKey:[
'pending-cash'
]
});


}


});



return (

<Card>


<CardHeader>

<CardTitle>

Cash Rewards Waiting Payment

</CardTitle>

</CardHeader>


<CardContent>


<table className="w-full text-sm">


<thead>

<tr className="border-b">

<th>
User
</th>

<th>
Amount
</th>

<th>
Bank
</th>

<th>
Action
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


{
reward.userId?.fullName
}


<br/>


<span className="text-muted-foreground">

{
reward.userId?.email
}

</span>


</td>



<td>

₦
{
reward.amount
}

</td>



<td>


{
reward.bankName
}


<br/>


{
reward.accountName
}


<br/>


{
reward.accountNumber
}


</td>



<td>


<Button

size="sm"

onClick={()=>mutation.mutate(reward._id)}

>

Mark Paid

</Button>


</td>


</tr>


)
)
}


</tbody>


</table>


</CardContent>


</Card>

)

}