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

  const observerRef =
    useRef<IntersectionObserver | null>(null);

  const generatedPosterRef =
    useRef<string | null>(null);

  const [
    thumbnail,
    setThumbnail,
  ] = useState<string | undefined>(
    poster,
  );

  const [
    loaded,
    setLoaded,
  ] = useState(false);

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
  ] = useState(
    !poster,
  );

  /*
   * Generate a thumbnail directly from the video.
   *
   * This happens entirely in the browser.
   * Nothing is sent to the backend.
   */
  useEffect(() => {
    if (poster) {
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

        /*
         * Wait for enough metadata to know
         * the video dimensions and duration.
         */
        await new Promise<void>(
          (resolve, reject) => {
            const handleLoadedMetadata =
              () => {
                cleanupListeners();
                resolve();
              };

            const handleError =
              () => {
                cleanupListeners();
                reject(
                  new Error(
                    'Unable to load video metadata',
                  ),
                );
              };

            const cleanupListeners =
              () => {
                video.removeEventListener(
                  'loadedmetadata',
                  handleLoadedMetadata,
                );

                video.removeEventListener(
                  'error',
                  handleError,
                );
              };

            video.addEventListener(
              'loadedmetadata',
              handleLoadedMetadata,
              {
                once: true,
              },
            );

            video.addEventListener(
              'error',
              handleError,
              {
                once: true,
              },
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

        /*
         * Pick a frame slightly after the beginning.
         *
         * This avoids black first frames on many videos.
         */
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
            const handleSeeked =
              () => {
                video.removeEventListener(
                  'seeked',
                  handleSeeked,
                );

                resolve();
              };

            video.addEventListener(
              'seeked',
              handleSeeked,
              {
                once: true,
              },
            );

            try {
              video.currentTime =
                seekTime;
            } catch {
              video.removeEventListener(
                'seeked',
                handleSeeked,
              );

              resolve();
            }
          },
        );

        if (cancelled) {
          return;
        }

        const canvas =
          document.createElement(
            'canvas',
          );

        /*
         * Limit the generated thumbnail
         * to a reasonable size.
         *
         * This keeps mobile memory usage low.
         */
        const maxWidth = 1280;

        const scale =
          Math.min(
            1,
            maxWidth /
              video.videoWidth,
          );

        canvas.width =
          Math.round(
            video.videoWidth *
              scale,
          );

        canvas.height =
          Math.round(
            video.videoHeight *
              scale,
          );

        const context =
          canvas.getContext(
            '2d',
          );

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
                if (!blob) {
                  resolve(null);
                  return;
                }

                resolve(
                  URL.createObjectURL(
                    blob,
                  ),
                );
              },
              'image/jpeg',
              0.82,
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
        /*
         * If thumbnail generation fails,
         * the video still works normally.
         */
      } finally {
        if (!cancelled) {
          setGeneratingThumbnail(
            false,
          );
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

        generatedPosterRef.current =
          null;
      }

      cleanup();
    };
  }, [src, poster]);

  const pauseOtherVideos =
    useCallback(() => {
      const videos =
        document.querySelectorAll<HTMLVideoElement>(
          VIDEO_SELECTOR,
        );

      videos.forEach(
        (video) => {
          if (
            video !==
            videoRef.current
          ) {
            video.pause();
          }
        },
      );
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
   * Autoplay when the video becomes visible.
   */
  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

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
          threshold: [
            0,
            0.25,
            0.5,
            autoPlayThreshold,
            0.75,
            1,
          ],
        },
      );

    observerRef.current =
      observer;

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
   * Video events.
   */
  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const onPlay =
      () => {
        setPlaying(true);
        setShowOverlay(false);
      };

    const onPause =
      () => {
        setPlaying(false);
      };

    const onLoaded =
      () => {
        setLoaded(true);
      };

    const onWaiting =
      () => {
        setLoaded(false);
      };

    const onCanPlay =
      () => {
        setLoaded(true);
      };

    video.addEventListener(
      'play',
      onPlay,
    );

    video.addEventListener(
      'pause',
      onPause,
    );

    video.addEventListener(
      'loadeddata',
      onLoaded,
    );

    video.addEventListener(
      'waiting',
      onWaiting,
    );

    video.addEventListener(
      'canplay',
      onCanPlay,
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

      video.removeEventListener(
        'loadeddata',
        onLoaded,
      );

      video.removeEventListener(
        'waiting',
        onWaiting,
      );

      video.removeEventListener(
        'canplay',
        onCanPlay,
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
        {/*
         * Thumbnail layer.
         *
         * This is especially useful on mobile
         * before the video starts playing.
         */}
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
                object-contain
                bg-black
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

        {/*
         * Only show the loading indicator when
         * there is no thumbnail available.
         *
         * This prevents the mobile blank/spinner
         * experience.
         */}
        {!thumbnail &&
          generatingThumbnail &&
          !loaded && (
            <div
              className="
                absolute
                inset-0
                z-20
                flex
                items-center
                justify-center
                bg-background/70
                backdrop-blur-sm
              "
            >
              <Loader2
                className="
                  h-8
                  w-8
                  animate-spin
                  text-primary
                "
              />
            </div>
          )}

        {/*
         * Manual play button when autoplay
         * is blocked by the browser.
         */}
        {showOverlay &&
          !playing && (
            <button
              type="button"
              onClick={
                togglePlayback
              }
              className="
                absolute
                inset-0
                z-30
                flex
                items-center
                justify-center
                bg-black/30
                transition
                hover:bg-black/40
              "
              aria-label="Play video"
            >
              <span
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-background/90
                  shadow-lg
                  backdrop-blur
                "
              >
                <Play
                  className="
                    ml-1
                    h-8
                    w-8
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