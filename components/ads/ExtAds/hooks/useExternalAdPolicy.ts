'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  ExternalAdPolicy,
} from '../types/external-ad-policy';

import {
  externalAdService,
} from '../services/external-ad.service';

import {
  externalAdManager,
} from '../services/external-ad-manager';

export interface UseExternalAdPolicyResult {
  policy: ExternalAdPolicy | null;

  isLoading: boolean;

  isRefreshing: boolean;

  error: Error | null;

  refresh: () => Promise<void>;
}

export function useExternalAdPolicy(): UseExternalAdPolicyResult {
  const [policy, setPolicy] =
    useState<ExternalAdPolicy | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  const mountedRef =
    useRef(true);

  const abortControllerRef =
    useRef<AbortController | null>(
      null,
    );

  const requestIdRef =
    useRef(0);

  const loadPolicy =
    useCallback(
      async (
        options?: {
          silent?: boolean;
        },
      ): Promise<void> => {
        const silent =
          options?.silent ?? false;

        abortControllerRef.current?.abort();

        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        const requestId =
          ++requestIdRef.current;

        if (!silent) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setError(null);

        try {
          const nextPolicy =
            await externalAdService.getPolicy(
              controller.signal,
            );

          if (
            !mountedRef.current ||
            requestId !==
              requestIdRef.current
          ) {
            return;
          }

          setPolicy(
            nextPolicy,
          );

          externalAdManager.setPolicy(
            nextPolicy,
          );
        } catch (cause) {
          if (
            controller.signal.aborted
          ) {
            return;
          }

          if (
            !mountedRef.current ||
            requestId !==
              requestIdRef.current
          ) {
            return;
          }

          const nextError =
            cause instanceof Error
              ? cause
              : new Error(
                  'Failed to load external ad policy',
                );

          setError(
            nextError,
          );

          /*
           * Fail closed if policy loading fails.
           */
          externalAdManager.setPolicy(
            null,
          );
        } finally {
          if (
            !mountedRef.current ||
            requestId !==
              requestIdRef.current
          ) {
            return;
          }

          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    mountedRef.current =
      true;

    void loadPolicy();

    return () => {
      mountedRef.current =
        false;

      abortControllerRef.current?.abort();
    };
  }, [loadPolicy]);

  const refresh =
    useCallback(
      async (): Promise<void> => {
        await loadPolicy({
          silent: true,
        });
      },
      [loadPolicy],
    );

  return {
    policy,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}