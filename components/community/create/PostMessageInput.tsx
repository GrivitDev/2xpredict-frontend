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
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder="Share your football thoughts..."
      aria-label="Post message"
      className="
        min-h-28
        w-full
        resize-none
        rounded-xl
        border-border
        bg-background
        px-3
        py-2.5
        text-xs
        leading-5
        shadow-sm
        placeholder:text-muted-foreground
        focus-visible:border-primary
        focus-visible:ring-1
        focus-visible:ring-primary/20
        sm:min-h-32
        sm:text-sm
      "
    />
  );
}