'use client';

import {
  useEffect,
  useState,
} from 'react';

export default function LegalReadingProgress() {
  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop =
        window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      setProgress(
        Math.min(
          100,
          Math.max(0, percentage)
        )
      );
    };

    updateProgress();

    window.addEventListener(
      'scroll',
      updateProgress,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'resize',
      updateProgress
    );

    return () => {
      window.removeEventListener(
        'scroll',
        updateProgress
      );

      window.removeEventListener(
        'resize',
        updateProgress
      );
    };
  }, []);

  return (
    <div
      className="
        pointer-events-none
        fixed
        inset-x-0
        top-0
        z-[100]
        h-1
      "
    >
      <div
        className="
          h-full
          rounded-r-full
          bg-primary
          shadow-[0_0_12px_hsl(var(--primary)/0.45)]
          transition-[width]
          duration-150
          ease-out
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}