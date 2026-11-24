'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';

const VIDEO_SRC =  '/2xliv.mp4';

export default function LiveTvComingSoon() {
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <main
      data-live-tv-page
      className="relative isolate h-[calc(100svh-var(--navbar-offset,54px)-4.5rem)] w-full shrink-0 overflow-hidden bg-[#eee6e3] text-[#2b1b22] dark:bg-[#10070c] dark:text-white lg:h-[calc(100svh-var(--navbar-offset,65px))]"
    >
      <style>{`
        @keyframes liveTvContentEnter {
          from { opacity: 0; transform: translate3d(0, 9px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        [data-live-tv-page] .live-tv-reveal {
          opacity: 0;
          animation: liveTvContentEnter 430ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        [data-live-tv-page] .live-tv-reveal-1 { animation-delay: 30ms; }
        [data-live-tv-page] .live-tv-reveal-2 { animation-delay: 90ms; }
        [data-live-tv-page] .live-tv-reveal-3 { animation-delay: 150ms; }
        [data-live-tv-page] .live-tv-reveal-4 { animation-delay: 210ms; }
        [data-live-tv-page] .live-tv-reveal-5 { animation-delay: 270ms; }
        [data-live-tv-page] .live-tv-reveal-6 { animation-delay: 330ms; }

        @media (prefers-reduced-motion: reduce) {
          [data-live-tv-page] .live-tv-reveal {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      {/* Video background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#eee6e3] dark:bg-[#10070c]"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            videoReady && !videoFailed ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      {/* Cinematic radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.08)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(20,5,12,0.2)_0%,rgba(20,5,12,0.08)_50%,transparent_78%)]"
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center justify-center px-4 py-3 text-center sm:px-8 sm:py-4 lg:px-14">
        <div className="w-full max-w-4xl rounded-[24px] border border-white/50 bg-white/45 px-5 py-6 shadow-[0_12px_50px_rgba(35,12,22,0.16)] backdrop-blur-[8px] dark:border-white/15 dark:bg-[#160912]/55 dark:shadow-[0_12px_50px_rgba(0,0,0,0.35)] sm:rounded-[30px] sm:px-10 sm:py-9 lg:px-14 lg:py-10">
          <div className="flex flex-col items-center">
            <div className="live-tv-reveal live-tv-reveal-1 mb-3 inline-flex items-center gap-2 rounded-full border border-[#792b49]/25 bg-white/85 px-3 py-1 shadow-[0_4px_16px_rgba(35,12,22,0.12)] dark:border-[#e7c58b]/35 dark:bg-black/55 sm:px-4 sm:py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8a3453] opacity-60 dark:bg-[#e7c58b]" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8a3453] dark:bg-[#e7c58b]" />
              </span>

              <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#702941] dark:text-[#f1d8ad] sm:text-[9px] sm:tracking-[0.27em]">
                A new way to watch is on the way
              </span>
            </div>

            <p className="live-tv-reveal live-tv-reveal-2 mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6e3b4d] drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)] dark:text-white dark:drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] sm:text-[11px]">
              Introducing
            </p>

            <div className="live-tv-reveal live-tv-reveal-2 mb-3 inline-flex items-center justify-center gap-2.5 sm:mb-4 sm:gap-3">
              <Image
                src="/logo1.png"
                alt="2xPredict"
                width={420}
                height={140}
                priority
                className="h-auto w-[clamp(104px,21vw,158px)] object-contain drop-shadow-[0_3px_12px_rgba(74,17,38,0.3)]"
              />

              <span className="font-serif text-[clamp(1.35rem,3.7vw,2.1rem)] font-normal italic leading-none tracking-[-0.035em] text-[#702941] drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)] dark:text-[#f0d6a9] dark:drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
                Live TV
              </span>
            </div>

            <h1 className="live-tv-reveal live-tv-reveal-3 max-w-4xl text-[clamp(1.9rem,5.5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#24151c] drop-shadow-[0_1px_5px_rgba(255,255,255,0.85)] [text-wrap:balance] dark:text-white dark:drop-shadow-[0_2px_7px_rgba(0,0,0,0.85)]">
              Your favourite matches.
              <span className="mt-1.5 block font-serif font-normal italic tracking-[-0.055em] text-[#702941] dark:text-[#f0d6a9] sm:mt-2">
                A whole new feeling.
              </span>
            </h1>

            <p className="live-tv-reveal live-tv-reveal-4 mt-3 max-w-lg text-[11px] leading-[1.35rem] text-[#34252b] drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)] dark:text-white dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:mt-4 sm:text-[13px] sm:leading-5">
              Watch your favourite matches on{' '}
              <span className="font-bold text-[#702941] dark:text-[#f5dfbd]">
                2xLive TV
              </span>
              . Experience the atmosphere, emotion and unforgettable moments of the beautiful game.
            </p>

            <div className="live-tv-reveal live-tv-reveal-5 mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3">
              <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#792b49]/30 bg-white/90 px-4 py-2 shadow-[0_4px_16px_rgba(35,12,22,0.1)] dark:border-[#e7c58b]/45 dark:bg-black/60 sm:min-h-10 sm:px-5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#792b49] dark:bg-[#e7c58b]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#702941] dark:text-[#f1d8ad] sm:text-[10px]">
                  Coming soon
                </span>
              </div>

              <Link
                href="/predictions"
                className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-[#702941]/25 bg-white/90 px-4 py-2 text-[11px] font-semibold text-[#562236] shadow-[0_4px_16px_rgba(35,12,22,0.1)] transition-all duration-200 hover:border-[#702941]/45 hover:bg-white dark:border-white/25 dark:bg-black/60 dark:text-white dark:hover:border-[#e7c58b]/50 dark:hover:bg-black/75 sm:min-h-10 sm:px-5 sm:text-xs"
              >
                Explore 2xPredict

                <FaArrowRight className="h-2.5 w-2.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="live-tv-reveal live-tv-reveal-6 mt-3 flex items-center gap-2 text-[7px] font-medium uppercase tracking-[0.17em] text-[#49363e] drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)] dark:text-white dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:mt-4 sm:text-[8px] sm:tracking-[0.22em]">
              <span className="h-px w-6 bg-[#8a3453]/60 dark:bg-[#e7c58b]/70 sm:w-9" />

              The game is about to feel different

              <span className="h-px w-6 bg-[#8a3453]/60 dark:bg-[#e7c58b]/70 sm:w-9" />
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {videoFailed ? 'Background video could not be loaded.' : 'Background video'}
      </span>
    </main>
  );
}