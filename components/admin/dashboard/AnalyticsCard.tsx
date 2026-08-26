import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

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
  highlight = false,
}: Props) {
  return (
    <div
      className={`
        rounded-lg
        border
        bg-card
        p-3
        shadow-sm
        ${
          highlight
            ? 'border-primary/40'
            : ''
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {title}
          </p>

          <div className="mt-1.5">
            {children}
          </div>

          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div
          className={`
            flex
            size-8
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            bg-muted/40
            ${
              highlight
                ? 'border-primary/30 text-primary'
                : 'text-muted-foreground'
            }
          `}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}