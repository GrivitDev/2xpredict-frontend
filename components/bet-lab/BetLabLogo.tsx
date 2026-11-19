'use client';

import { useEffect, useState } from 'react';
import { initials, logoUrlsOf } from './bet-lab.utils';

type Props = {
  src?: unknown;
  name: string;
  sizeClassName?: string;
  className?: string;
  fallbackClassName?: string;
  shape?: 'circle' | 'rounded' | 'plain';
  eager?: boolean;
};

/** Shared provider-logo renderer. It tries each supplied URL before falling
 * back to team/competition initials, so one bad provider URL does not hide a
 * valid alternative logo from the same fixture payload. */
export default function BetLabLogo({
  src,
  name,
  sizeClassName = 'h-6 w-6',
  className = '',
  fallbackClassName = '',
  shape = 'circle',
  eager = false,
}: Props) {
  const sources = logoUrlsOf(src);
  const sourceKey = sources.join('|');
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceKey]);

  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-md' : '';
  const activeSource = sources[sourceIndex];

  if (activeSource) {
    return (
      <img
        src={activeSource}
        alt={`${name} logo`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setSourceIndex((current) => current + 1)}
        className={`${sizeClassName} shrink-0 object-contain ${shapeClass} ${className}`.trim()}
      />
    );
  }

  return (
    <span
      aria-label={`${name} logo unavailable`}
      className={`flex ${sizeClassName} shrink-0 items-center justify-center border border-border/70 bg-muted/80 font-extrabold text-muted-foreground ${shapeClass} ${fallbackClassName}`.trim()}
    >
      <span className="truncate text-[8px] leading-none">{initials(name)}</span>
    </span>
  );
}

