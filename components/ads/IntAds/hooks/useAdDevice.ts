'use client';

import { useEffect, useState } from 'react';

import { AdDevice } from '@/constants/ads/ad-device';

export function useAdDevice() {

  const [device, setDevice] =
    useState<AdDevice>(
      AdDevice.DESKTOP,
    );

  useEffect(() => {

    function updateDevice() {

      const width =
        window.innerWidth;

      if (width < 768) {

        setDevice(
          AdDevice.MOBILE,
        );

        return;

      }

      if (width < 1024) {

        setDevice(
          AdDevice.TABLET,
        );

        return;

      }

      setDevice(
        AdDevice.DESKTOP,
      );

    }

    updateDevice();

    window.addEventListener(
      'resize',
      updateDevice,
    );

    return () =>
      window.removeEventListener(
        'resize',
        updateDevice,
      );

  }, []);

  return device;

}