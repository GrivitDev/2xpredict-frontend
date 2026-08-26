'use client';

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
    <div
      className="
        overflow-hidden
        rounded-lg
        border
        bg-card
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          px-3
          py-2.5
        "
      >
        <h3 className="text-sm font-medium">
          {title}
        </h3>

        {users.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {users.length} users
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 w-12 px-3 text-[11px]">
                Rank
              </TableHead>

              <TableHead className="h-8 px-3 text-[11px]">
                User
              </TableHead>

              <TableHead className="h-8 px-3 text-[11px]">
                Email
              </TableHead>

              <TableHead className="h-8 px-3 text-right text-[11px]">
                Value
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="
                    h-20
                    px-3
                    text-center
                    text-xs
                    text-muted-foreground
                  "
                >
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.userId}>
                  <TableCell className="px-3 py-2">
                    <Badge
                      variant="secondary"
                      className="
                        h-5
                        min-w-7
                        justify-center
                        rounded-md
                        px-1.5
                        text-[10px]
                        font-medium
                      "
                    >
                      #{index + 1}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {user.fullName}
                      </p>

                      <p className="truncate text-[10px] text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[220px] truncate px-3 py-2 text-xs text-muted-foreground">
                    {user.email}
                  </TableCell>

                  <TableCell className="px-3 py-2 text-right text-xs font-semibold tabular-nums">
                    {user[metric] ?? 0}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}