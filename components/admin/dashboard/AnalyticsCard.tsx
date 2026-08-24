import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  LucideIcon,
} from 'lucide-react';

import {
  ReactNode,
} from 'react';

interface Props {
  title: string;

  children: ReactNode;

  description?: string;

  icon: LucideIcon;

  highlight?: boolean;
}

export default function AnalyticsCard({
  title,
  children,
  description,
  icon: Icon,
  highlight,
}: Props) {
  return (
    <Card
      className={`
        surface-card
        transition-all
        ${
          highlight
            ? 'border-primary/40 shadow-sm'
            : ''
        }
      `}
    >
      <CardHeader
        className="
          flex
          flex-row
          items-center
          justify-between
          pb-3
        "
      >
        <CardTitle
          className="
            text-s
            font-medium
            text-muted-foreground
          "
        >
          {title}
        </CardTitle>

        <Icon
          size={20}
          className="text-primary"
        />
      </CardHeader>

      <CardContent className="space-y-3">
        {children}

        {description && (
          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}