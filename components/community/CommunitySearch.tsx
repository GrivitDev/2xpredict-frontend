'use client';

import {
  Search,
} from 'lucide-react';

import {
  Input,
} from '@/components/ui/input';

interface CommunitySearchProps {
  value: string;
  onChange: (
    value: string,
  ) => void;
  autoFocus?: boolean;
}

export default function CommunitySearch({
  value,
  onChange,
  autoFocus = false,
}: CommunitySearchProps) {
  return (
    <div
      className="
        relative
        w-full
      "
    >
      <Search
        className="
          pointer-events-none
          absolute
          left-3.5
          top-1/2
          size-4
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
          onChange(
            event.target.value,
          )
        }
        placeholder="Search posts, users, or discussions..."
        aria-label="Search community posts and discussions"
        className="
          h-10
          rounded-full
          border-border
          bg-background
          pl-10
          pr-4
          shadow-sm
          transition-colors
          placeholder:text-muted-foreground/70
          focus-visible:border-ring
          focus-visible:ring-ring/30
        "
      />
    </div>
  );
}