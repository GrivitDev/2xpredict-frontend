import {
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface LegalNoticeProps {
  type?: 'info' | 'warning' | 'success';
  title: string;
  children: React.ReactNode;
}

const variants = {
  info: {
    icon: Info,
    classes: `
      border-blue-500/20
      bg-blue-500/8
      text-blue-500
    `,
  },

  warning: {
    icon: AlertTriangle,
    classes: `
      border-yellow-500/20
      bg-yellow-500/8
      text-yellow-500
    `,
  },

  success: {
    icon: CheckCircle2,
    classes: `
      border-emerald-500/20
      bg-emerald-500/8
      text-emerald-500
    `,
  },
};

export default function LegalNotice({
  type = 'info',
  title,
  children,
}: LegalNoticeProps) {
  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        `
          my-10
          overflow-hidden
          rounded-3xl
          border
          bg-background/70
          shadow-sm
          backdrop-blur-sm
          transition-all
          duration-300
        `,
        variant.classes
      )}
    >
      <div
        className="
          flex
          items-start
          gap-4
          p-5
          sm:gap-5
          sm:p-6
        "
      >
        <div
          className={cn(
            `
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              bg-background/80
            `,
            variant.classes
          )}
        >
          <Icon
            className="
              h-5
              w-5
            "
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className="
              text-base
              font-semibold
              text-foreground
              sm:text-lg
            "
          >
            {title}
          </h4>

          <div
            className="
              mt-2
              text-sm
              leading-7
              text-muted-foreground
              sm:text-base
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}