'use client';

import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import type {
  ExternalAdRequest,
  ExternalAdResult,
} from '../types/external-ad';

import {
  ExternalAdFormat,
} from '../types/external-ad-format';

import {
  externalAdManager,
} from '../services/external-ad-manager';

import {
  useExternalAd,
} from '../hooks/useExternalAd';

interface ExternalAdProps {
  format: ExternalAdFormat;

  placement?: string;

  width?: number;

  height?: number;

  metadata?: Record<string, unknown>;

  className?: string;

  autoLoad?: boolean;

  enabled?: boolean;

  loadWhenAllowed?: boolean;

  onLoaded?: (
    result: ExternalAdResult,
  ) => void;

  onError?: (
    error: Error,
  ) => void;

  children?: React.ReactNode;
}

export function ExternalAd({
  format,
  placement,
  width,
  height,
  metadata,
  className,
  autoLoad = true,
  enabled,
  loadWhenAllowed = true,
  onLoaded,
  onError,
  children,
}: ExternalAdProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const mountedInstanceIdRef =
    useRef<string | null>(null);

  const {
    ad,
    instance,
    isLoading,
    error,
    canLoad,
    load,
    destroy,
  } = useExternalAd({
    format,
    placement,
    width,
    height,
    metadata,
    autoLoad,
    enabled,
    loadWhenAllowed,
  });

  const mountProviderAd =
    useCallback(
      async (
        result: ExternalAdResult,
      ) => {
        const container =
          containerRef.current;

        const providerInstance =
          result.instance;

        if (
          !container ||
          !providerInstance
        ) {
          return;
        }

        if (
          mountedInstanceIdRef.current ===
          providerInstance.id
        ) {
          return;
        }

        container.replaceChildren();

        const request: ExternalAdRequest =
          {
            format,
            placement,
            width,
            height,
            metadata,
          };

        await externalAdManager.mount(
          providerInstance,
          container,
          request,
        );

        mountedInstanceIdRef.current =
          providerInstance.id;

        onLoaded?.(result);
      },
      [
        format,
        placement,
        width,
        height,
        metadata,
        onLoaded,
      ],
    );

  useEffect(() => {
    if (
      !instance ||
      !containerRef.current
    ) {
      return;
    }

    void mountProviderAd({
      ad: instance.ad,
      instance,
    });
  }, [
    instance,
    mountProviderAd,
  ]);

  useEffect(() => {
    if (!error) {
      return;
    }

    onError?.(error);
  }, [
    error,
    onError,
  ]);

  useEffect(() => {
    return () => {
      const instanceId =
        mountedInstanceIdRef.current;

      mountedInstanceIdRef.current =
        null;

      if (instanceId) {
        void externalAdManager.destroy(
          instanceId,
        );
      }
    };
  }, []);

  const handleLoad =
    useCallback(async () => {
      const result =
        await load();

      if (
        result?.instance &&
        containerRef.current
      ) {
        await mountProviderAd(
          result,
        );
      }
    }, [
      load,
      mountProviderAd,
    ]);

  if (enabled === false) {
    return null;
  }

  return (
    <div
      data-external-ad="true"
      data-external-ad-format={format}
      data-external-ad-placement={
        placement
      }
      className={className}
    >
      <div
        ref={containerRef}
        data-external-ad-container="true"
        aria-label="Advertisement"
      />

      {children}

      {!autoLoad &&
        canLoad &&
        !ad && (
          <button
            type="button"
            onClick={() => {
              void handleLoad();
            }}
            disabled={isLoading}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          >
            Load advertisement
          </button>
        )}
    </div>
  );
}