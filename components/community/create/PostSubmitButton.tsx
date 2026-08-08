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
        h-11
        w-full
        rounded-xl
        bg-primary
        px-5
        text-sm
        font-semibold
        text-primary-foreground
        shadow-sm
        transition-all
        hover:bg-primary/90
        active:scale-[0.99]
        disabled:pointer-events-none
        disabled:opacity-60
        sm:h-12
        sm:text-base
      "
    >
      {loading ? (
        <>
          <Loader2
            className="size-4 animate-spin sm:size-[18px]"
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