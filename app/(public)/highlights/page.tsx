import { Suspense } from 'react';
import HighlightsPage from '@/components/highlights/highlights-page';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <HighlightsPage />
    </Suspense>
  );
}
