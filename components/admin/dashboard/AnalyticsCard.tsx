import {
Card,
CardContent,
CardHeader,
CardTitle,
} from '@/components/ui/card';


import {
LucideIcon,
} from 'lucide-react';



interface Props{

title:string;

value:string|number;

description?:string;

icon:LucideIcon;

highlight?:boolean;

}



export default function AnalyticsCard({

title,

value,

description,

icon:Icon,

highlight,

}:Props){


return (

<Card
className={`
surface-card
transition-all
${highlight?'border-primary/40':''}
`}
>


<CardHeader
className="
flex
flex-row
items-center
justify-between
"
>

<CardTitle
className="
text-sm
text-muted-foreground
"
>

{title}

</CardTitle>


<Icon
size={20}
/>


</CardHeader>



<CardContent>


<div
className="
text-3xl
font-bold
"
>

{value}

</div>



{
description &&
<p
className="
text-xs
text-muted-foreground
mt-1
"
>

{description}

</p>
}


</CardContent>


</Card>

);

}