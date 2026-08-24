'use client';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <Card className="surface-card">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 px-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  Rank
                </TableHead>

                <TableHead>
                  User
                </TableHead>

                <TableHead>
                  Email
                </TableHead>

                <TableHead className="text-right">
                  Value
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="min-w-10 justify-center"
                      >
                        #{index + 1}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium leading-none">
                          {user.fullName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>

                    <TableCell className="text-right font-semibold tabular-nums">
                      {user[metric] ?? 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}