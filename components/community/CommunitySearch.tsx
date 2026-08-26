'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface CommunitySearchProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export default function CommunitySearch({
  value,
  onChange,
  autoFocus = false,
}: CommunitySearchProps) {
  return (
    <div className="relative w-full">
      <Search
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          size-3.5
          -translate-y-1/2
          text-muted-foreground
        "
        aria-hidden="true"
      />

      <Input
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search posts, users, or discussions..."
        aria-label="Search community posts and discussions"
        className="
          h-9
          rounded-lg
          border-border/70
          bg-background/80
          pl-9
          pr-3
          text-sm
          shadow-none
          transition-colors
          placeholder:text-muted-foreground/60
          focus-visible:border-primary/40
          focus-visible:ring-2
          focus-visible:ring-primary/10
        "
      />
    </div>
  );
}