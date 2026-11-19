import { Suspense } from 'react';
import BetLabApp from '@/components/bet-lab/BetLabApp';

export default function BetLabPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground"
        >
          Loading Bet Lab...
        </div>
      }
    >
      <BetLabApp />
    </Suspense>
  );
}
