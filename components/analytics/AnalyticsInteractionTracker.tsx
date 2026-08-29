'use client';

import {
  useEffect,
} from 'react';

import {
  useAnalytics,
} from '@/hooks/use-analytics';

const SCROLL_MILESTONES = [
  25,
  50,
  75,
  90,
  100,
];

function getElementName(
  element: HTMLElement,
): string {
  const explicitName =
    element.getAttribute(
      'data-analytics-name',
    );

  if (explicitName) {
    return explicitName.slice(0, 200);
  }

  const ariaLabel =
    element.getAttribute(
      'aria-label',
    );

  if (ariaLabel) {
    return ariaLabel.slice(0, 200);
  }

  const id = element.id;

  if (id) {
    return `#${id}`.slice(0, 200);
  }

  const name =
    element.getAttribute('name');

  if (name) {
    return name.slice(0, 200);
  }

  return element.tagName.toLowerCase();
}

function getElementText(
  element: HTMLElement,
): string {
  const text =
    element.textContent
      ?.replace(/\s+/g, ' ')
      .trim();

  return text
    ? text.slice(0, 200)
    : '';
}

function findTrackableElement(
  target: EventTarget | null,
): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest(
    'a, button, [role="button"], [data-analytics]',
  ) as HTMLElement | null;
}

export default function AnalyticsInteractionTracker() {
  const analytics = useAnalytics();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const trackedScrollMilestones =
      new Set<number>();

    let scrollTicking = false;

    // ========================================================
    // CLICK TRACKING
    // ========================================================

    const handleClick = (
      event: MouseEvent,
    ) => {
      const element =
        findTrackableElement(
          event.target,
        );

      if (!element) {
        return;
      }

      const elementName =
        getElementName(element);

      const text =
        getElementText(element);

      const tag =
        element.tagName.toLowerCase();

      const href =
        element instanceof HTMLAnchorElement
          ? element.href
          : '';

      const eventType =
        element.matches(
          'a',
        )
          ? 'link_click'
          : element.matches(
                'button, [role="button"]',
              )
            ? 'button_click'
            : 'click';

      analytics.track({
        eventType,
        eventName: eventType,
        properties: {
          element: elementName,
          text,
          tag,
          href,
        },
      });
    };

    document.addEventListener(
      'click',
      handleClick,
      true,
    );

    // ========================================================
    // FORM TRACKING
    // ========================================================

    const startedForms =
      new WeakSet<HTMLFormElement>();

    const handleFocusIn = (
      event: FocusEvent,
    ) => {
      const target =
        event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const form =
        target.closest(
          'form',
        );

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      if (
        !startedForms.has(form)
      ) {
        startedForms.add(form);

        analytics.track({
          eventType: 'form_start',
          eventName: 'form_start',
          properties: {
            form:
              form.getAttribute(
                'data-analytics-name',
              ) ??
              form.getAttribute(
                'name',
              ) ??
              form.id ??
              'form',
          },
        });
      }
    };

    const handleSubmit = (
      event: SubmitEvent,
    ) => {
      const form =
        event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      analytics.track({
        eventType: 'form_submit',
        eventName: 'form_submit',
        properties: {
          form:
            form.getAttribute(
              'data-analytics-name',
            ) ??
            form.getAttribute(
              'name',
            ) ??
            form.id ??
            'form',
        },
      });
    };

    document.addEventListener(
      'focusin',
      handleFocusIn,
      true,
    );

    document.addEventListener(
      'submit',
      handleSubmit,
      true,
    );

    // ========================================================
    // SCROLL TRACKING
    // ========================================================

    const getScrollPercentage = (): number => {
      const documentHeight =
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        );

      const viewportHeight =
        window.innerHeight;

      const scrollableHeight =
        documentHeight -
        viewportHeight;

      if (scrollableHeight <= 0) {
        return 100;
      }

      return Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (window.scrollY /
              scrollableHeight) *
              100,
          ),
        ),
      );
    };

    const handleScroll = () => {
      if (scrollTicking) {
        return;
      }

      scrollTicking = true;

      window.requestAnimationFrame(() => {
        scrollTicking = false;

        const percentage =
          getScrollPercentage();

        for (const milestone of SCROLL_MILESTONES) {
          if (
            percentage >= milestone &&
            !trackedScrollMilestones.has(
              milestone,
            )
          ) {
            trackedScrollMilestones.add(
              milestone,
            );

            analytics.track({
              eventType: 'scroll',
              eventName: 'scroll',
              properties: {
                percentage:
                  milestone,
              },
            });
          }
        }
      });
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      },
    );

    // ========================================================
    // SEARCH TRACKING
    // ========================================================

    const handleSearchSubmit = (
      event: Event,
    ) => {
      const target =
        event.target;

      if (
        !(target instanceof
          HTMLInputElement)
      ) {
        return;
      }

      if (
        target.type !== 'search' &&
        target.getAttribute(
          'data-analytics-search',
        ) === null
      ) {
        return;
      }

      const value =
        target.value
          .trim()
          .slice(0, 200);

      if (!value) {
        return;
      }

      analytics.track({
        eventType: 'search',
        eventName: 'search',
        properties: {
          searchTerm: value,
        },
      });
    };

    document.addEventListener(
      'change',
      handleSearchSubmit,
      true,
    );

    // ========================================================
    // ERROR TRACKING
    // ========================================================

    const handleWindowError = (
      event: ErrorEvent,
    ) => {
      analytics.track({
        eventType: 'error',
        eventName: 'javascript_error',
        properties: {
          message:
            event.message?.slice(
              0,
              500,
            ) ?? '',

          source:
            event.filename?.slice(
              0,
              300,
            ) ?? '',

          line:
            event.lineno ?? 0,

          column:
            event.colno ?? 0,
        },
      });
    };

    const handleUnhandledRejection = (
      event: PromiseRejectionEvent,
    ) => {
      let reason = '';

      try {
        if (
          event.reason instanceof Error
        ) {
          reason =
            event.reason.message;
        } else {
          reason =
            String(
              event.reason ?? '',
            );
        }
      } catch {
        reason = '';
      }

      analytics.track({
        eventType: 'error',
        eventName:
          'unhandled_promise_rejection',
        properties: {
          message:
            reason.slice(0, 500),
        },
      });
    };

    window.addEventListener(
      'error',
      handleWindowError,
    );

    window.addEventListener(
      'unhandledrejection',
      handleUnhandledRejection,
    );

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      document.removeEventListener(
        'click',
        handleClick,
        true,
      );

      document.removeEventListener(
        'focusin',
        handleFocusIn,
        true,
      );

      document.removeEventListener(
        'submit',
        handleSubmit,
        true,
      );

      window.removeEventListener(
        'scroll',
        handleScroll,
      );

      document.removeEventListener(
        'change',
        handleSearchSubmit,
        true,
      );

      window.removeEventListener(
        'error',
        handleWindowError,
      );

      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
    };
  }, [analytics]);

  return null;
}