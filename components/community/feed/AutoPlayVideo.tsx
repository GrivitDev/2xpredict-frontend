'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Loader2,
  Play,
} from 'lucide-react';

interface AutoPlayVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlayThreshold?: number;
}

const VIDEO_SELECTOR =
  'video[data-community-video="true"]';

export default function AutoPlayVideo({
  src,
  poster,
  className = '',
  autoPlayThreshold = 0.6,
}: AutoPlayVideoProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const generatedPosterRef =
    useRef<string | null>(null);

  const [
    thumbnail,
    setThumbnail,
  ] = useState<string | undefined>(
    poster,
  );

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    showOverlay,
    setShowOverlay,
  ] = useState(false);

  const [
    generatingThumbnail,
    setGeneratingThumbnail,
  ] = useState(!poster);

  /*
   * Generate a lightweight thumbnail
   * entirely in the browser.
   */
  useEffect(() => {
    if (poster) {
      setThumbnail(poster);
      setGeneratingThumbnail(false);
      return;
    }

    let cancelled = false;

    const video =
      document.createElement('video');

    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const generateThumbnail = async () => {
      try {
        setGeneratingThumbnail(true);

        await new Promise<void>(
          (resolve, reject) => {
            const onMetadata = () => {
              cleanupListeners();
              resolve();
            };

            const onError = () => {
              cleanupListeners();
              reject(
                new Error(
                  'Unable to load video metadata',
                ),
              );
            };

            const cleanupListeners = () => {
              video.removeEventListener(
                'loadedmetadata',
                onMetadata,
              );

              video.removeEventListener(
                'error',
                onError,
              );
            };

            video.addEventListener(
              'loadedmetadata',
              onMetadata,
              { once: true },
            );

            video.addEventListener(
              'error',
              onError,
              { once: true },
            );

            video.src = src;
          },
        );

        if (
          cancelled ||
          !video.videoWidth ||
          !video.videoHeight
        ) {
          return;
        }

        const duration =
          Number.isFinite(video.duration)
            ? video.duration
            : 0;

        const seekTime =
          duration > 0
            ? Math.min(
                Math.max(
                  duration * 0.05,
                  0.1,
                ),
                Math.max(
                  duration - 0.1,
                  0,
                ),
              )
            : 0;

        await new Promise<void>(
          (resolve) => {
            const onSeeked = () => {
              resolve();
            };

            video.addEventListener(
              'seeked',
              onSeeked,
              { once: true },
            );

            try {
              video.currentTime =
                seekTime;
            } catch {
              video.removeEventListener(
                'seeked',
                onSeeked,
              );

              resolve();
            }
          },
        );

        if (cancelled) {
          return;
        }

        /*
         * Smaller thumbnail keeps mobile
         * memory and canvas usage low.
         */
        const maxWidth = 960;

        const scale = Math.min(
          1,
          maxWidth / video.videoWidth,
        );

        const canvas =
          document.createElement('canvas');

        canvas.width = Math.round(
          video.videoWidth * scale,
        );

        canvas.height = Math.round(
          video.videoHeight * scale,
        );

        const context =
          canvas.getContext('2d');

        if (!context) {
          return;
        }

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const thumbnailUrl =
          await new Promise<
            string | null
          >((resolve) => {
            canvas.toBlob(
              (blob) => {
                resolve(
                  blob
                    ? URL.createObjectURL(
                        blob,
                      )
                    : null,
                );
              },
              'image/jpeg',
              0.78,
            );
          });

        if (
          cancelled ||
          !thumbnailUrl
        ) {
          if (thumbnailUrl) {
            URL.revokeObjectURL(
              thumbnailUrl,
            );
          }

          return;
        }

        generatedPosterRef.current =
          thumbnailUrl;

        setThumbnail(
          thumbnailUrl,
        );
      } catch {
        // Video remains functional.
      } finally {
        if (!cancelled) {
          setGeneratingThumbnail(false);
        }
      }
    };

    void generateThumbnail();

    return () => {
      cancelled = true;

      if (
        generatedPosterRef.current
      ) {
        URL.revokeObjectURL(
          generatedPosterRef.current,
        );

        generatedPosterRef.current = null;
      }

      cleanup();
    };
  }, [src, poster]);

  /*
   * Keep only one community video playing.
   */
  const pauseOtherVideos =
    useCallback(() => {
      const currentVideo =
        videoRef.current;

      if (!currentVideo) {
        return;
      }

      document
        .querySelectorAll<HTMLVideoElement>(
          VIDEO_SELECTOR,
        )
        .forEach((video) => {
          if (video !== currentVideo) {
            video.pause();
          }
        });
    }, []);

  const playVideo =
    useCallback(async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      pauseOtherVideos();

      try {
        await video.play();

        setPlaying(true);
        setShowOverlay(false);
      } catch {
        setPlaying(false);
        setShowOverlay(true);
      }
    }, [pauseOtherVideos]);

  const pauseVideo =
    useCallback(() => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      video.pause();
      setPlaying(false);
    }, []);

  const togglePlayback =
    useCallback(async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      if (video.paused) {
        setShowOverlay(false);
        await playVideo();
      } else {
        pauseVideo();
      }
    }, [
      playVideo,
      pauseVideo,
    ]);

  /*
   * Lightweight visibility detection.
   */
  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry) {
            return;
          }

          if (
            entry.intersectionRatio >=
            autoPlayThreshold
          ) {
            void playVideo();
          } else {
            pauseVideo();
          }
        },
        {
          threshold:
            autoPlayThreshold,
        },
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
      pauseVideo();
    };
  }, [
    autoPlayThreshold,
    pauseVideo,
    playVideo,
  ]);

  /*
   * Synchronize playback state.
   */
  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const onPlay = () => {
      setPlaying(true);
      setShowOverlay(false);
    };

    const onPause = () => {
      setPlaying(false);
    };

    video.addEventListener(
      'play',
      onPlay,
    );

    video.addEventListener(
      'pause',
      onPause,
    );

    return () => {
      video.removeEventListener(
        'play',
        onPlay,
      );

      video.removeEventListener(
        'pause',
        onPause,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-lg
        bg-muted
        ${className}
      `}
    >
      <div
        className="
          relative
          aspect-video
          w-full
          bg-black
        "
      >
        {thumbnail &&
          !playing && (
            <img
              src={thumbnail}
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-0
                h-full
                w-full
                bg-black
                object-contain
              "
            />
          )}

        <video
          ref={videoRef}
          data-community-video="true"
          src={src}
          poster={thumbnail}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          controlsList="nodownload"
          className="
            relative
            z-10
            h-full
            w-full
            bg-black
            object-contain
            touch-manipulation
          "
        />

        {!thumbnail &&
          generatingThumbnail && (
            <div
              className="
                absolute
                inset-0
                z-20
                flex
                items-center
                justify-center
                bg-background/60
              "
            >
              <Loader2
                className="
                  h-6
                  w-6
                  animate-spin
                  text-primary
                "
              />
            </div>
          )}

        {showOverlay &&
          !playing && (
            <button
              type="button"
              onClick={togglePlayback}
              className="
                absolute
                inset-0
                z-30
                flex
                items-center
                justify-center
                bg-black/25
                transition-colors
                hover:bg-black/35
              "
              aria-label="Play video"
            >
              <span
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-background/90
                  shadow-md
                  backdrop-blur
                "
              >
                <Play
                  className="
                    ml-0.5
                    h-6
                    w-6
                    fill-current
                    text-primary
                  "
                />
              </span>
            </button>
          )}
      </div>
    </div>
  );
}