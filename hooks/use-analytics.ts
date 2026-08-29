'use client';

import {
  useMemo,
} from 'react';

import {
  AnalyticsClient,
} from '@/lib/analytics/analytics-client';

import type {
  AnalyticsEventInput,
} from '@/lib/analytics/analytics-types';

let analyticsClient:
  | AnalyticsClient
  | null = null;

export function setAnalyticsClient(
  client: AnalyticsClient | null,
) {
  analyticsClient = client;
}

export interface AnalyticsApi {
  track(
    event: AnalyticsEventInput,
  ): void;

  pageView(
    path: string,
  ): void;

  heartbeat(
    durationMs?: number,
  ): void;

  getVisitorId(): string;

  getSessionId(): string;
}

export function useAnalytics(): AnalyticsApi {
  return useMemo(
    () => ({
      track(
        event: AnalyticsEventInput,
      ) {
        analyticsClient?.track(event);
      },

      pageView(path: string) {
        analyticsClient?.pageView(path);
      },

      heartbeat(
        durationMs?: number,
      ) {
        void durationMs;
        analyticsClient?.heartbeat();
      },

      getVisitorId() {
        return (
          analyticsClient?.getVisitorId() ??
          ''
        );
      },

      getSessionId() {
        return (
          analyticsClient?.getSessionId() ??
          ''
        );
      },
    }),
    [],
  );
}