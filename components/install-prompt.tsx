'use client';

import {
  useEffect,
  useState,
} from 'react';

export default function InstallPrompt() {
  const [
    deferredPrompt,

    setDeferredPrompt,
  ] = useState<any>(
    null,
  );

  const [
    visible,

    setVisible,
  ] = useState(false);

  useEffect(() => {
    const handler = (
      e: any,
    ) => {
      e.preventDefault();

      setDeferredPrompt(
        e,
      );

      setVisible(true);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handler,
    );

    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handler,
      );
  }, []);

  const installApp =
    async () => {
      if (
        !deferredPrompt
      )
        return;

      deferredPrompt.prompt();

      const result =
        await deferredPrompt.userChoice;

      if (
        result.outcome ===
        'accepted'
      ) {
        setVisible(
          false,
        );
      }
    };

  if (!visible)
    return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 bg-green-600 rounded-2xl p-5 shadow-2xl z-50">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">
            Install App
          </h2>

          <p className="text-white/80 text-sm mt-1">
            Install Sure Predict
            Pro on your device.
          </p>
        </div>

        <button
          onClick={
            installApp
          }
          className="bg-white text-black px-5 py-3 rounded-xl font-bold"
        >
          Install
        </button>
      </div>
    </div>
  );
}