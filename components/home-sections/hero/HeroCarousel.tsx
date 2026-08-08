'use client';

import type {
  EmblaViewportRefType,
} from 'embla-carousel-react';

import HeroSlideComponent from './HeroSlide';

import HeroIndicators from './HeroIndicators';

import type {
  HeroSlide,
} from './hero.types';

interface HeroCarouselProps {
  emblaRef: EmblaViewportRefType;

  slides: HeroSlide[];

  selectedIndex: number;

  isLoggedIn: boolean;
}

export default function HeroCarousel({
  emblaRef,
  slides,
  selectedIndex,
  isLoggedIn,
}: HeroCarouselProps) {
  return (
    <div
      className="
        relative
        h-full
        w-full
        bg-white
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >
      {/* Embla viewport */}

      <div
        ref={emblaRef}
        className="
          h-full
          w-full
          overflow-hidden
        "
      >
        {/* Slides container */}

        <div
          className="
            flex
            h-full
            touch-pan-y
          "
        >
          {slides.map(
            (
              slide,
            ) => (
              <div
                key={
                  slide.id
                }
                className="
                  relative
                  h-full
                  min-w-full
                  flex-[0_0_100%]
                  bg-white
                  dark:bg-slate-950
                "
              >
                <HeroSlideComponent
                  slide={
                    slide
                  }
                  isLoggedIn={
                    isLoggedIn
                  }
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* Indicators */}

      <HeroIndicators
        total={
          slides.length
        }
        active={
          selectedIndex
        }
      />
    </div>
  );
}