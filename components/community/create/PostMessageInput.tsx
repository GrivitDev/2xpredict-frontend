'use client';

import { Textarea } from '@/components/ui/textarea';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PostMessageInput({
  value,
  onChange,
}: Props) {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Share your football thoughts..."
      aria-label="Post message"
      className="
        min-h-32
        w-full
        resize-none
        rounded-xl
        border-border
        bg-background/60
        px-4
        py-3
        text-sm
        leading-6
        shadow-sm
        transition-colors
        placeholder:text-muted-foreground
        focus-visible:border-primary
        focus-visible:ring-primary/20
        sm:min-h-[140px]
        sm:text-base
      "
    />
  );
}