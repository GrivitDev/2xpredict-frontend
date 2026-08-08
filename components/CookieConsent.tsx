'use client';

import Link from 'next/link';
import {
  useEffect,
  useState,
} from 'react';


export default function CookieConsent() {

  const [visible, setVisible] =
    useState(false);


  useEffect(() => {

    const consent =
      localStorage.getItem(
        'cookie-consent'
      );


    if (!consent) {
      setVisible(true);
    }

  }, []);



  const saveConsent = (
    value: 'accepted' | 'rejected'
  ) => {

    localStorage.setItem(
      'cookie-consent',
      value
    );

    setVisible(false);

  };



  if (!visible) {
    return null;
  }



  return (

    <div
      className="
        fixed
        bottom-4
        left-4
        right-4
        z-[200]
        mx-auto
        max-w-5xl
        rounded-3xl
        border
        bg-background/90
        p-6
        shadow-2xl
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >


        <div
          className="
            max-w-3xl
          "
        >

          <h3
            className="
              text-lg
              font-bold
            "
          >
            We value your privacy
          </h3>


          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            We use cookies to improve your experience,
            maintain security, analyze website usage, and
            support advertising services. You can manage
            your preferences at any time.
          </p>


          <Link
            href="/cookie-policy"
            className="
              mt-3
              inline-block
              text-sm
              font-semibold
              text-primary
              hover:underline
            "
          >
            Read our Cookie Policy
          </Link>

        </div>



        <div
          className="
            flex
            gap-3
          "
        >

          <button
            onClick={() =>
              saveConsent('rejected')
            }
            className="
              rounded-xl
              border
              px-5
              py-3
              text-sm
              font-semibold
              transition
              hover:bg-muted
            "
          >
            Reject
          </button>


          <button
            onClick={() =>
              saveConsent('accepted')
            }
            className="
              rounded-xl
              bg-primary
              px-5
              py-3
              text-sm
              font-semibold
              text-primary-foreground
              transition
              hover:opacity-90
            "
          >
            Accept
          </button>

        </div>


      </div>

    </div>

  );
}