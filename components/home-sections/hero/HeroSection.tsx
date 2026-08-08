'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import Autoplay from 'embla-carousel-autoplay';

import {
  heroSlides,
} from './hero.data';

import HeroCarousel from './HeroCarousel';

import type {
  HeroSlide,
} from './hero.types';

interface HeroSectionProps {
  isLoggedIn?: boolean;

  advertisements?: HeroSlide[];
}

export default function HeroSection({
  isLoggedIn = false,
  advertisements = [],
}: HeroSectionProps) {
  const slides = useMemo(() => {
    const activeAds =
      advertisements.filter(
        (
          item,
        ) =>
          item.advertisement === true,
      );

    return [
      ...heroSlides,
      ...activeAds,
    ];
  }, [
    advertisements,
  ]);

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 3500,

        stopOnInteraction: false,

        stopOnMouseEnter: true,
      }),
    [],
  );

  const [
    emblaRef,
    emblaApi,
  ] = useEmblaCarousel(
    {
      loop: true,

      align: 'center',

      duration: 45,
    },
    [
      autoplay,
    ],
  );

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(
      emblaApi.selectedScrollSnap(),
    );
  }, [
    emblaApi,
  ]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on(
      'select',
      onSelect,
    );

    emblaApi.on(
      'reInit',
      onSelect,
    );

    return () => {
      emblaApi.off(
        'select',
        onSelect,
      );

      emblaApi.off(
        'reInit',
        onSelect,
      );
    };
  }, [
    emblaApi,
    onSelect,
  ]);

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-background
        text-foreground
        transition-colors
        duration-500
      "
    >
      <div
        className="
          relative
          w-full
          min-h-[420px]
          overflow-hidden

          lg:h-[500px]

          bg-white
          dark:bg-slate-950
        "
      >
        <HeroCarousel
          emblaRef={
            emblaRef
          }
          slides={
            slides
          }
          selectedIndex={
            selectedIndex
          }
          isLoggedIn={
            isLoggedIn
          }
        />
      </div>
    </section>
  );
}