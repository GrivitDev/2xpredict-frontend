'use client';

import { useEffect } from 'react';

import {
  initializeExternalAdProviders,
} from './providers/initializeExternalAdProviders';

import {
  useExternalAdPolicy,
} from './hooks/useExternalAdPolicy';

export function ExternalAds() {
  useEffect(() => {
    void initializeExternalAdProviders();
  }, []);

  useExternalAdPolicy();

  return null;
}