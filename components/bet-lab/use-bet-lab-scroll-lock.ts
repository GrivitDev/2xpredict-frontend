'use client';

import { useEffect } from 'react';

type InlineStyleSnapshot = {
  htmlOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  bodyPaddingRight: string;
};

let lockCount = 0;
let lockedScrollY = 0;
let originalStyles: InlineStyleSnapshot | null = null;

function acquireBodyScrollLock(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    originalStyles = {
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    html.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${lockedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount !== 0 || !originalStyles) return;

    const html = document.documentElement;
    const body = document.body;
    const snapshot = originalStyles;
    originalStyles = null;

    html.style.overflow = snapshot.htmlOverflow;
    body.style.position = snapshot.bodyPosition;
    body.style.top = snapshot.bodyTop;
    body.style.left = snapshot.bodyLeft;
    body.style.right = snapshot.bodyRight;
    body.style.width = snapshot.bodyWidth;
    body.style.overflow = snapshot.bodyOverflow;
    body.style.paddingRight = snapshot.bodyPaddingRight;

    window.scrollTo(0, lockedScrollY);
  };
}

/** Locks the page behind an open Bet Lab drawer/dialog without losing scroll position. */
export default function useBetLabScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return acquireBodyScrollLock();
  }, [active]);
}
