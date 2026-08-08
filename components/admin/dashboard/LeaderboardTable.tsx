'use client';

import {

Table,

TableBody,

TableCell,

TableHead,

TableHeader,

TableRow,

} from '@/components/ui/table';

import {
Badge,
} from '@/components/ui/badge';

import {
AnalyticsLeaderboardUser,
} from '@/types/analytics.types';

interface Props {

title: string;

users: AnalyticsLeaderboardUser[];

metric: keyof AnalyticsLeaderboardUser;

}

export default function LeaderboardTable({

title,

users,

metric,

}: Props) {

return (

<div className="rounded-xl border overflow-hidden">

<div className="border-b px-6 py-4">

<h3 className="font-semibold">
{title}
</h3>

</div>

<Table>

<TableHeader>

<TableRow>

<TableHead>#</TableHead>

<TableHead>User</TableHead>

<TableHead>Email</TableHead>

<TableHead className="text-right">
Value
</TableHead>

</TableRow>

</TableHeader>

<TableBody>

{users.map((user,index)=>(

<TableRow key={user.userId}>

<TableCell>

<Badge>

#{index+1}

</Badge>

</TableCell>

<TableCell>

<div>

<p className="font-medium">

{user.fullName}

</p>

<p className="text-xs text-muted-foreground">

@{user.username}

</p>

</div>

</TableCell>

<TableCell>

{user.email}

</TableCell>

<TableCell className="text-right font-semibold">

{user[metric] ?? 0}

</TableCell>

</TableRow>

))}

</TableBody>

</Table>

</div>

);

}