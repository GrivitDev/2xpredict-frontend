'use client';

import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PostTitleInput({
  value,
  onChange,
}: Props) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Example: Arsenal vs Chelsea thoughts"
      aria-label="Post title"
      className="
        h-11
        w-full
        rounded-xl
        border-border
        bg-background/60
        px-4
        text-sm
        shadow-sm
        transition-colors
        placeholder:text-muted-foreground
        focus-visible:border-primary
        focus-visible:ring-primary/20
        sm:h-12
        sm:text-base
      "
    />
  );
}