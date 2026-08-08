'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ExternalAdFormat,
} from '../types/external-ad-format';

import type {
  ExternalAd,
  ExternalAdInstance,
  ExternalAdRequest,
} from '../types/external-ad';

import type {
  ExternalAdResult,
} from '../types/external-ad';

import {
  externalAdManager,
} from '../services/external-ad-manager';

import {
  externalAdService,
} from '../services/external-ad.service';

import {
  canShowExternalAd,
} from '../utils/frequency';

import {
  getLastExternalAdShownAt,
  setLastExternalAdShownAt,
} from '../utils/storage';

export interface UseExternalAdOptions {
  format: ExternalAdFormat;

  placement?: string;

  width?: number;

  height?: number;

  metadata?: Record<string, unknown>;

  /**
   * When true, the hook automatically requests the ad
   * after the component mounts.
   *
   * Default: false.
   *
   * This keeps ad loading explicit and prevents every
   * mounted ad component from unexpectedly requesting
   * provider resources.
   */
  autoLoad?: boolean;

  /**
   * Optional policy supplied by useExternalAdPolicy().
   *
   * When omitted, the manager's current policy is used.
   */
  enabled?: boolean;

  /**
   * Prevents automatic loading while the placement is
   * not currently visible.
   */
  loadWhenAllowed?: boolean;
}

export interface UseExternalAdResult {
  ad: ExternalAd | null;

  instance: ExternalAdInstance | null;

  isLoading: boolean;

  error: Error | null;

  canLoad: boolean;

  load: () => Promise<ExternalAdResult | null>;

  destroy: () => Promise<void>;

  reset: () => void;
}

export function useExternalAd(
  options: UseExternalAdOptions,
): UseExternalAdResult {
  const {
    format,
    placement,
    width,
    height,
    metadata,
    autoLoad = false,
    enabled,
    loadWhenAllowed = true,
  } = options;

  const [ad, setAd] =
    useState<ExternalAd | null>(
      null,
    );

  const [instance, setInstance] =
    useState<ExternalAdInstance | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  const mountedRef =
    useRef(true);

  const requestRef =
    useRef<ExternalAdRequest | null>(
      null,
    );

  const loadingRef =
    useRef(false);

  const instanceIdRef =
    useRef<string | null>(null);

  const request = useMemo(
    () =>
      externalAdService.createRequest(
        format,
        {
          placement,
          width,
          height,
          metadata,
        },
      ),
    [
      format,
      placement,
      width,
      height,
      metadata,
    ],
  );

  requestRef.current =
    request;

  const canLoad = useMemo(() => {
    if (
      enabled === false
    ) {
      return false;
    }

    if (!loadWhenAllowed) {
      return true;
    }

    const policy =
      externalAdManager.getPolicy();

    if (!policy?.enabled) {
      return false;
    }

    return canShowExternalAd(
      policy,
      getLastExternalAdShownAt(),
    );
  }, [
    enabled,
    loadWhenAllowed,
  ]);

  const destroy =
    useCallback(
      async (): Promise<void> => {
        const instanceId =
          instanceIdRef.current;

        if (!instanceId) {
          return;
        }

        instanceIdRef.current =
          null;

        try {
          await externalAdManager.destroy(
            instanceId,
          );
        } finally {
          if (
            mountedRef.current
          ) {
            setInstance(null);
          }
        }
      },
      [],
    );

  const load =
    useCallback(
      async (): Promise<ExternalAdResult | null> => {
        if (
          loadingRef.current
        ) {
          return null;
        }

        if (
          enabled === false
        ) {
          return null;
        }

        const currentRequest =
          requestRef.current;

        if (!currentRequest) {
          return null;
        }

        const policy =
          externalAdManager.getPolicy();

        if (!policy?.enabled) {
          return null;
        }

        if (
          !externalAdManager.isFormatAllowed(
            currentRequest,
          )
        ) {
          return null;
        }

        if (
          loadWhenAllowed &&
          !canShowExternalAd(
            policy,
            getLastExternalAdShownAt(),
          )
        ) {
          return null;
        }

        loadingRef.current =
          true;

        if (
          mountedRef.current
        ) {
          setIsLoading(true);
          setError(null);
        }

        try {
          await destroy();

          const result =
            await externalAdManager.load(
              currentRequest,
            );

          if (
            !result
          ) {
            return null;
          }

          if (
            mountedRef.current
          ) {
            setAd(result.ad);

            if (
              result.instance
            ) {
              setInstance(
                result.instance,
              );

              instanceIdRef.current =
                result.instance.id;
            }

            setLastExternalAdShownAt();
          }

          return result;
        } catch (cause) {
          const nextError =
            cause instanceof Error
              ? cause
              : new Error(
                  'Failed to load external advertisement',
                );

          if (
            mountedRef.current
          ) {
            setError(nextError);
          }

          return null;
        } finally {
          loadingRef.current =
            false;

          if (
            mountedRef.current
          ) {
            setIsLoading(false);
          }
        }
      },
      [
        enabled,
        loadWhenAllowed,
        destroy,
      ],
    );

  const reset =
    useCallback(() => {
      if (
        !mountedRef.current
      ) {
        return;
      }

      setAd(null);
      setInstance(null);
      setError(null);
      loadingRef.current =
        false;
      instanceIdRef.current =
        null;
    }, []);

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;

      const instanceId =
        instanceIdRef.current;

      instanceIdRef.current =
        null;

      if (instanceId) {
        void externalAdManager.destroy(
          instanceId,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void load();
  }, [autoLoad, load]);

  return {
    ad,
    instance,
    isLoading,
    error,
    canLoad,
    load,
    destroy,
    reset,
  };
}