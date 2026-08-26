'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

type Consent = 'accepted' | 'rejected';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(
      !localStorage.getItem('cookie-consent'),
    );
  }, []);

  const saveConsent = (value: Consent) => {
    localStorage.setItem('cookie-consent', value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="
        fixed
        bottom-4
        left-3
        right-3
        z-[200]
        mx-auto
        max-w-3xl
        rounded-2xl
        border
        border-border/60
        bg-background/95
        shadow-2xl
        backdrop-blur-xl
      "
    >
      <div className="flex gap-4 p-5">

        <div
          className="
            hidden
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
            sm:flex
          "
        >
          <Cookie className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="text-base font-semibold">
            Your Privacy Matters
          </h3>

          <p
            className="
              mt-1
              text-s
              leading-6
              text-muted-foreground
            "
          >
            We use cookies to keep 2xPredict secure,
            improve performance, remember your
            preferences, and understand how our site is
            used. By selecting <strong>Accept</strong>,
            you consent to our use of cookies.
          </p>

          <Link
            href="/cookie-policy"
            className="
              mt-2
              inline-flex
              text-s
              font-medium
              text-primary
              hover:underline
            "
          >
            Learn more in our Cookie Policy
          </Link>

          <div
            className="
              mt-4
              flex
              flex-col-reverse
              gap-2
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={() => saveConsent('rejected')}
              className="
                rounded-xl
                border
                border-border
                px-4
                py-2.5
                text-s
                font-medium
                transition-colors
                hover:bg-muted
              "
            >
              Not Now
            </button>

            <button
              type="button"
              onClick={() => saveConsent('accepted')}
              className="
                rounded-xl
                bg-primary
                px-4
                py-2.5
                text-s
                font-semibold
                text-primary-foreground
                transition-opacity
                hover:opacity-90
              "
            >
              Accept Cookies
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}