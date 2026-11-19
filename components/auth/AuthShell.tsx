import Image from 'next/image';
import type { ReactNode } from 'react';

export const authInputClassName =
  'h-10 w-full min-w-0 rounded-lg border border-border/70 bg-background/85 px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60';

export const authButtonClassName =
  'inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60';

export const authSecondaryButtonClassName =
  'inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60';

interface AuthFeedbackProps {
  kind: 'error' | 'success' | 'info';
  children: ReactNode;
}

export function AuthFeedback({ kind, children }: AuthFeedbackProps) {
  const styles = {
    error: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    info: 'border-primary/20 bg-primary/5 text-foreground',
  } as const;

  return (
    <div className={`min-w-0 rounded-lg border px-3 py-2.5 text-xs leading-5 ${styles[kind]}`}>
      {children}
    </div>
  );
}

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'wide';
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
  variant = 'default',
}: AuthShellProps) {
  const cardWidth = variant === 'wide' ? 'max-w-2xl' : 'max-w-md';

  return (
    <main className="relative z-0 flex min-h-[100svh] w-full min-w-0 items-start justify-center overflow-x-clip bg-background px-3 pb-8 pt-[calc(2.625rem+env(safe-area-inset-top))] sm:px-5 sm:pt-[calc(2.875rem+env(safe-area-inset-top))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 -z-0 mx-auto h-64 max-w-3xl rounded-full bg-primary/[0.045] blur-3xl"
      />

      <section className={`relative z-0 w-full ${cardWidth} min-w-0`}>
        <div className="overflow-hidden rounded-2xl border border-border/75 bg-card/95 shadow-[0_18px_55px_-28px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="border-b border-border/70 bg-gradient-to-br from-muted/45 via-card/90 to-primary/[0.045] px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="mb-3 flex min-h-10 items-center">
              <Image
                src="/logo1.png"
                alt="2xPredict"
                width={156}
                height={48}
                priority
                className="h-10 w-auto max-w-[9.75rem] object-contain object-left"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 max-w-prose break-words text-xs leading-5 text-muted-foreground sm:text-[13px]">
                {description}
              </p>
            ) : null}
          </div>

          <div className="min-w-0 px-4 py-4 sm:px-6 sm:py-5">{children}</div>

          {footer ? (
            <div className="border-t border-border/65 bg-muted/15 px-4 py-3 text-center text-xs text-muted-foreground sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
