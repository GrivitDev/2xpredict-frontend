'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa6';

/** A single-click light/dark toggle. No menu or intermediate choices. */
export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render the control immediately; do not leave an empty placeholder during hydration.
  const isDark = mounted && resolvedTheme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const Icon = isDark ? FaSun : FaMoon;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-visible border-0 bg-transparent p-0 text-[var(--chrome-foreground)] shadow-none outline-none transition-transform duration-200 hover:scale-110 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]/75 focus-visible:ring-offset-0 sm:h-11 sm:w-11"
    >
      <Icon className="block h-[18px] w-[18px] shrink-0" aria-hidden="true" />
    </button>
  );
}
