'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  loading: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function PostSubmitButton({
  loading,
  onClick,
  children,
}: Props) {
  return (
    <Button
      type="button"
      disabled={loading}
      onClick={onClick}
      aria-busy={loading}
      className="
        h-10
        w-full
        gap-2
        rounded-xl
        px-4
        text-xs
        font-semibold
        shadow-sm
        sm:h-11
        sm:text-sm
      "
    >
      {loading ? (
        <>
          <Loader2
            className="size-4 animate-spin"
            aria-hidden="true"
          />
          <span>Publishing...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}