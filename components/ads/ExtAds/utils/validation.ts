import type {
  ExternalAd,
  ExternalAdRequest,
} from '../types/external-ad';

import {
  ExternalAdFormat,
} from '../types/external-ad-format';

import type {
  ExternalAdPolicy,
} from '../types/external-ad-policy';

const EXTERNAL_AD_FORMATS =
  new Set<string>(
    Object.values(
      ExternalAdFormat,
    ),
  );

export function isExternalAdFormat(
  value: unknown,
): value is ExternalAdFormat {
  return (
    typeof value === 'string' &&
    EXTERNAL_AD_FORMATS.has(value)
  );
}

export function isExternalAdPolicy(
  value: unknown,
): value is ExternalAdPolicy {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const policy =
    value as Record<string, unknown>;

  return (
    typeof policy.enabled ===
      'boolean' &&
    typeof policy.showInternalAds ===
      'boolean' &&
    (
      policy.frequency === 'NONE' ||
      policy.frequency === 'LOW' ||
      policy.frequency ===
        'NORMAL'
    ) &&
    typeof policy.aggressive ===
      'boolean' &&
    typeof policy.refreshInterval ===
      'number' &&
    Number.isFinite(
      policy.refreshInterval,
    ) &&
    policy.refreshInterval >= 0 &&
    typeof policy.allowPopup ===
      'boolean' &&
    typeof policy.allowInterstitial ===
      'boolean' &&
    typeof policy.allowRewarded ===
      'boolean'
  );
}

export function isExternalAdRequest(
  value: unknown,
): value is ExternalAdRequest {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const request =
    value as Record<string, unknown>;

  if (
    !isExternalAdFormat(
      request.format,
    )
  ) {
    return false;
  }

  if (
    request.placement !== undefined &&
    typeof request.placement !==
      'string'
  ) {
    return false;
  }

  if (
    request.width !== undefined &&
    (
      typeof request.width !==
        'number' ||
      !Number.isFinite(
        request.width,
      ) ||
      request.width <= 0
    )
  ) {
    return false;
  }

  if (
    request.height !== undefined &&
    (
      typeof request.height !==
        'number' ||
      !Number.isFinite(
        request.height,
      ) ||
      request.height <= 0
    )
  ) {
    return false;
  }

  return true;
}

export function isExternalAd(
  value: unknown,
): value is ExternalAd {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const ad =
    value as Record<string, unknown>;

  return (
    typeof ad.id ===
      'string' &&
    ad.id.length > 0 &&
    typeof ad.providerId ===
      'string' &&
    ad.providerId.length > 0 &&
    isExternalAdFormat(
      ad.format,
    )
  );
}

/**
 * Validates and normalizes a provider-supplied ad.
 *
 * Unknown provider metadata is intentionally preserved.
 */
export function validateExternalAd(
  value: unknown,
): ExternalAd {
  if (!isExternalAd(value)) {
    throw new Error(
      'Invalid external advertisement payload',
    );
  }

  return value;
}

/**
 * Safely validates a positive dimension.
 */
export function isValidAdDimension(
  value: unknown,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0
  );
}