'use client';

import {
  useEffect,
  useState,
} from 'react';

import { AdDevice } from '@/constants/ads/ad-device';

function getAdDevice(): AdDevice {
  const width =
    window.innerWidth;

  if (width < 768) {
    return AdDevice.MOBILE;
  }

  if (width < 1024) {
    return AdDevice.TABLET;
  }

  return AdDevice.DESKTOP;
}

export function useAdDevice() {
  const [device, setDevice] =
    useState<AdDevice>(
      AdDevice.DESKTOP,
    );

  useEffect(() => {
    const updateDevice = () => {
      const nextDevice =
        getAdDevice();

      setDevice((current) =>
        current === nextDevice
          ? current
          : nextDevice,
      );
    };

    updateDevice();

    window.addEventListener(
      'resize',
      updateDevice,
      { passive: true },
    );

    return () =>
      window.removeEventListener(
        'resize',
        updateDevice,
      );
  }, []);

  return device;
}