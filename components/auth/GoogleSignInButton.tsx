'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonOptions = {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  logo_alignment?: 'left' | 'center';
};

type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string;
    ux_mode?: 'popup' | 'redirect';
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdentityApi;
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

/**
 * Renders Google's official Identity Services button. The returned ID token
 * is passed to the backend, where its signature, audience and claims are verified.
 */
export default function GoogleSignInButton({
  onCredential,
  disabled = false,
}: GoogleSignInButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const disabledRef = useRef(disabled);
  const initializedRef = useRef(false);
  const [configurationError, setConfigurationError] = useState('');
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const initializeGoogleButton = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const container = buttonContainerRef.current;
    const googleIdentity = window.google?.accounts?.id;

    if (!container || initializedRef.current) return;

    if (!clientId) {
      setConfigurationError(
        'Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to the frontend environment.',
      );
      return;
    }

    if (!googleIdentity) return;

    setConfigurationError('');
    container.replaceChildren();

    googleIdentity.initialize({
      client_id: clientId,
      ux_mode: 'popup',
      callback: (response) => {
        const idToken = response.credential;
        if (!idToken || disabledRef.current) return;
        void callbackRef.current(idToken);
      },
    });

    const availableWidth = container.clientWidth || 360;
    googleIdentity.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(400, Math.max(200, Math.floor(availableWidth))),
    });

    initializedRef.current = true;
  }, []);

  useEffect(() => {
    // Handles client-side navigation back to an auth page after the GIS script
    // has already been loaded by Next.js.
    if (window.google?.accounts?.id) initializeGoogleButton();
  }, [initializeGoogleButton]);

  return (
    <div className="w-full space-y-2">
      <div
        ref={buttonContainerRef}
        className={`flex min-h-10 w-full justify-center overflow-hidden ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        aria-label="Continue with Google"
        aria-busy={disabled}
      />

      {!configurationError && !scriptError ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={initializeGoogleButton}
          onError={() => setScriptError(true)}
        />
      ) : null}

      {configurationError ? (
        <p role="alert" className="text-center text-xs leading-5 text-status-danger">
          {configurationError}
        </p>
      ) : null}

      {scriptError ? (
        <p role="alert" className="text-center text-xs leading-5 text-status-danger">
          Google sign-in could not load. Check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}
