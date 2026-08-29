import Cookies from 'js-cookie';

import {
  getOrCreateSession,
  getVisitorId,
} from './analytics-storage';

import type {
  AnalyticsEventInput,
  AnalyticsSessionSnapshot,
  QueuedAnalyticsEvent,
} from './analytics-types';

const EVENT_BATCH_SIZE = 10;

const EVENT_FLUSH_INTERVAL_MS = 5000;

const SESSION_SYNC_INTERVAL_MS = 30000;

const MAX_QUEUE_SIZE = 100;

export class AnalyticsClient {
  private readonly apiUrl: string;

  private queue: QueuedAnalyticsEvent[] = [];

  private eventFlushTimer:
    | ReturnType<typeof setTimeout>
    | null = null;

  private sessionSyncTimer:
    | ReturnType<typeof setInterval>
    | null = null;

  private session: AnalyticsSessionSnapshot;

  private activeTimeMs = 0;

  private lastActiveTick = 0;

  private pageStartedAt = 0;

  private started = false;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');

    const storedSession = getOrCreateSession();

    this.session = {
      visitorId: getVisitorId(),

      sessionId: storedSession.sessionId,

      startedAt: storedSession.startedAt,

      lastActivityAt: storedSession.lastActivityAt,

      pageViews: 0,

      eventCount: 0,

      durationMs: 0,

      currentPath: '',

      landingPage: '',
    };
  }

  // =========================================================
  // START
  // =========================================================

  start() {
    if (
      this.started ||
      typeof window === 'undefined'
    ) {
      return;
    }

    this.started = true;

    this.lastActiveTick = Date.now();

    this.pageStartedAt = Date.now();

    this.startEventFlushTimer();

    this.sessionSyncTimer = setInterval(() => {
      if (
        document.visibilityState !== 'visible'
      ) {
        return;
      }

      this.updateActiveTime();

      void this.syncSession();
    }, SESSION_SYNC_INTERVAL_MS);

    this.track({
      eventType: 'session_start',
      eventName: 'session_start',
    });

    void this.syncSession();
  }

  // =========================================================
  // STOP
  // =========================================================

  stop() {
    if (!this.started) {
      return;
    }

    this.updateActiveTime();

    if (this.sessionSyncTimer) {
      clearInterval(this.sessionSyncTimer);

      this.sessionSyncTimer = null;
    }

    if (this.eventFlushTimer) {
      clearTimeout(this.eventFlushTimer);

      this.eventFlushTimer = null;
    }

    this.track({
      eventType: 'session_end',
      eventName: 'session_end',
      path: this.session.currentPath,
      durationMs: this.activeTimeMs,
    });

    void this.endSession();

    void this.flush(true);

    this.started = false;
  }

  // =========================================================
  // IDENTIFIERS
  // =========================================================

  getVisitorId() {
    return this.session.visitorId;
  }

  getSessionId() {
    return this.session.sessionId;
  }

  getSnapshot() {
    return {
      ...this.session,
      activeTimeMs: this.activeTimeMs,
    };
  }

  // =========================================================
  // TRACK
  // =========================================================

  track(
    input: AnalyticsEventInput,
  ) {
    if (
      typeof window === 'undefined' ||
      !this.apiUrl
    ) {
      return;
    }

    const now = Date.now();

    const path =
      input.path ??
      `${window.location.pathname}${window.location.search}`;

    const pageTitle =
      input.pageTitle ??
      document.title ??
      '';

    if (input.eventType === 'page_view') {
      this.session.pageViews += 1;

      if (!this.session.landingPage) {
        this.session.landingPage = path;
      }

      this.session.currentPath = path;

      this.pageStartedAt = now;
    }

    this.session.lastActivityAt = now;

    this.session.durationMs = Math.max(
      0,
      now - this.session.startedAt,
    );

    this.session.eventCount += 1;

    const event: QueuedAnalyticsEvent = {
      eventId: this.createEventId(),

      visitorId: this.session.visitorId,

      sessionId: this.session.sessionId,

      eventType: input.eventType,

      eventName:
        input.eventName ??
        input.eventType,

      path,

      pageTitle,

      url: window.location.href,

      properties:
        input.properties ?? {},

      occurredAt:
        new Date(now).toISOString(),

      durationMs:
        input.durationMs ?? 0,

      deviceType:
        this.getDeviceType(),

      browser:
        this.getBrowser(),

      operatingSystem:
        this.getOperatingSystem(),

      screenWidth:
        window.screen.width,

      screenHeight:
        window.screen.height,

      referrer:
        document.referrer ?? '',

      utmSource:
        this.getQueryParameter(
          'utm_source',
        ),

      utmMedium:
        this.getQueryParameter(
          'utm_medium',
        ),

      utmCampaign:
        this.getQueryParameter(
          'utm_campaign',
        ),

      utmTerm:
        this.getQueryParameter(
          'utm_term',
        ),

      utmContent:
        this.getQueryParameter(
          'utm_content',
        ),

      userAgent:
        navigator.userAgent,
    };

    this.queue.push(event);

    if (
      this.queue.length >= EVENT_BATCH_SIZE
    ) {
      void this.flush();
    } else {
      this.scheduleEventFlush();
    }
  }

  // =========================================================
  // PAGE VIEW
  // =========================================================

  pageView(path: string) {
    this.updateActiveTime();

    this.track({
      eventType: 'page_view',
      eventName: 'page_view',
      path,
    });
  }

  // =========================================================
  // PAGE EXIT
  // =========================================================

  pageExit(path?: string, durationMs?: number) {
    this.updateActiveTime();

    const effectiveDurationMs = durationMs ?? Math.max(
      0,
      Date.now() - this.pageStartedAt,
    );

    this.track({
      eventType: 'page_exit',
      eventName: 'page_exit',
      path,
      durationMs: effectiveDurationMs,
    });

    void this.syncSession();

    void this.flush(true);
  }

  // =========================================================
  // HEARTBEAT
  // =========================================================

  heartbeat() {
    this.updateActiveTime();

    this.track({
      eventType: 'heartbeat',
      eventName: 'heartbeat',
      durationMs: this.activeTimeMs,
    });
  }

  // =========================================================
  // ACTIVE TIME
  // =========================================================

  updateActiveTime() {
    if (typeof document === 'undefined') {
      return;
    }

    const now = Date.now();

    if (
      document.visibilityState === 'visible'
    ) {
      if (this.lastActiveTick > 0) {
        const elapsed =
          now - this.lastActiveTick;

        if (
          elapsed > 0 &&
          elapsed <= 60000
        ) {
          this.activeTimeMs += elapsed;
        }
      }
    }

    this.lastActiveTick = now;

    this.session.lastActivityAt = now;

    this.session.durationMs = Math.max(
      0,
      now - this.session.startedAt,
    );
  }

  // =========================================================
  // SESSION SYNC
  // =========================================================

  async syncSession() {
    if (
      typeof window === 'undefined' ||
      !this.apiUrl
    ) {
      return;
    }

    const body = {
      visitorId:
        this.session.visitorId,

      sessionId:
        this.session.sessionId,

      timestamp:
        new Date().toISOString(),

      durationMs:
        this.session.durationMs,

      activeTimeMs:
        this.activeTimeMs,

      path:
        this.session.currentPath,

      landingPage:
        this.session.landingPage,

      pageViews:
        this.session.pageViews,

      eventCount:
        this.session.eventCount,

      isActive:
        document.visibilityState === 'visible',

      bounced:
        this.session.pageViews <= 1,

      deviceType:
        this.getDeviceType(),

      browser:
        this.getBrowser(),

      operatingSystem:
        this.getOperatingSystem(),

      screenWidth:
        window.screen.width,

      screenHeight:
        window.screen.height,

      referrer:
        document.referrer ?? '',

      utmSource:
        this.getQueryParameter(
          'utm_source',
        ),

      utmMedium:
        this.getQueryParameter(
          'utm_medium',
        ),

      utmCampaign:
        this.getQueryParameter(
          'utm_campaign',
        ),

      utmTerm:
        this.getQueryParameter(
          'utm_term',
        ),

      utmContent:
        this.getQueryParameter(
          'utm_content',
        ),
    };

    try {
      await this.request(
        `${this.apiUrl}/website-analytics/session`,
        body,
      );
    } catch {
      // Analytics must never break the website.
    }
  }

  // =========================================================
  // END SESSION
  // =========================================================

  async endSession() {
    this.updateActiveTime();

    if (typeof window === 'undefined') {
      return;
    }

    const body = {
      sessionId:
        this.session.sessionId,

      timestamp:
        new Date().toISOString(),

      path:
        this.session.currentPath,

      durationMs:
        this.session.durationMs,

      activeTimeMs:
        this.activeTimeMs,

      pageViews:
        this.session.pageViews,

      eventCount:
        this.session.eventCount,
    };

    const url =
      `${this.apiUrl}/website-analytics/session/end`;

    try {
      const token =
        Cookies.get('token');

      if (
        token &&
        typeof navigator.sendBeacon ===
          'function'
      ) {

        /*
         * sendBeacon cannot set the Authorization
         * header, so authenticated session-end
         * requests use fetch instead.
         */
      }

      await this.request(
        url,
        body,
        true,
      );
    } catch {
      // Ignore analytics failures.
    }
  }

  // =========================================================
  // FLUSH EVENTS
  // =========================================================

  async flush(
    keepalive = false,
  ) {
    if (
      !this.queue.length ||
      typeof window === 'undefined' ||
      !this.apiUrl
    ) {
      return;
    }

    const events =
      this.queue.splice(
        0,
        this.queue.length,
      );

    try {
      const response =
        await this.request(
          `${this.apiUrl}/website-analytics/events`,
          {
            events,
          },
          keepalive,
        );

      if (!response.ok) {
        this.requeue(events);
      }
    } catch {
      this.requeue(events);
    }
  }

  // =========================================================
  // AUTHENTICATED REQUEST
  // =========================================================

  private request(
    url: string,
    body: unknown,
    keepalive = false,
  ) {
    const token =
      Cookies.get('token');

    return fetch(
      url,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        body:
          JSON.stringify(body),

        keepalive,
      },
    );
  }

  // =========================================================
  // REQUEUE
  // =========================================================

  private requeue(
    events: QueuedAnalyticsEvent[],
  ) {
    this.queue = [
      ...events,
      ...this.queue,
    ].slice(
      0,
      MAX_QUEUE_SIZE,
    );
  }

  // =========================================================
  // EVENT TIMER
  // =========================================================

  private scheduleEventFlush() {
    if (this.eventFlushTimer) {
      return;
    }

    this.eventFlushTimer =
      setTimeout(
        () => {
          this.eventFlushTimer =
            null;

          void this.flush();
        },
        EVENT_FLUSH_INTERVAL_MS,
      );
  }

  private startEventFlushTimer() {
    this.scheduleEventFlush();
  }

  // =========================================================
  // EVENT ID
  // =========================================================

  private createEventId(): string {
    const id =
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID ===
        'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

    return `event_${id}`;
  }

  // =========================================================
  // URL PARAMETER
  // =========================================================

  private getQueryParameter(
    key: string,
  ): string {
    try {
      return (
        new URLSearchParams(
          window.location.search,
        ).get(key) ?? ''
      );
    } catch {
      return '';
    }
  }

  // =========================================================
  // DEVICE
  // =========================================================

  private getDeviceType(): string {
    const width =
      window.innerWidth;

    if (width <= 767) {
      return 'mobile';
    }

    if (width <= 1024) {
      return 'tablet';
    }

    return 'desktop';
  }

  // =========================================================
  // BROWSER
  // =========================================================

  private getBrowser(): string {
    const userAgent =
      navigator.userAgent;

    if (/Edg\//i.test(userAgent)) {
      return 'Edge';
    }

    if (/OPR\//i.test(userAgent)) {
      return 'Opera';
    }

    if (/Chrome\//i.test(userAgent)) {
      return 'Chrome';
    }

    if (/Firefox\//i.test(userAgent)) {
      return 'Firefox';
    }

    if (/Safari\//i.test(userAgent)) {
      return 'Safari';
    }

    return 'Unknown';
  }

  // =========================================================
  // OPERATING SYSTEM
  // =========================================================

  private getOperatingSystem(): string {
    const userAgent =
      navigator.userAgent;

    if (/Windows/i.test(userAgent)) {
      return 'Windows';
    }

    if (/Android/i.test(userAgent)) {
      return 'Android';
    }

    if (
      /iPhone|iPad|iPod/i.test(
        userAgent,
      )
    ) {
      return 'iOS';
    }

    if (/Mac OS X/i.test(userAgent)) {
      return 'macOS';
    }

    if (/Linux/i.test(userAgent)) {
      return 'Linux';
    }

    return 'Unknown';
  }
}