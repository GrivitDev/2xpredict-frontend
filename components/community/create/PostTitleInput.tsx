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
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder="Example: Arsenal vs Chelsea thoughts"
      aria-label="Post title"
      className="
        h-10
        w-full
        rounded-xl
        border-border
        bg-background
        px-3
        text-xs
        shadow-sm
        placeholder:text-muted-foreground
        focus-visible:border-primary
        focus-visible:ring-1
        focus-visible:ring-primary/20
        sm:h-11
        sm:text-sm
      "
    />
  );
}