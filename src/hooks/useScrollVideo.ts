import { useEffect, useRef, useCallback } from "react";
import { type MotionValue } from "framer-motion";

/**
 * Syncs an HTML5 `<video>` element's `currentTime` directly with a Framer Motion scroll progress value.
 *
 * Designed for 60fps frame-accurate scrubbing with:
 * - Decoder seek queuing (prevents browser media pipeline stalls if user scrolls rapidly)
 * - requestAnimationFrame throttling
 * - Automatic pause, mute, and inline playback setup
 *
 * @param scrollProgress - A MotionValue<number> from 0..1 representing scroll progress
 * @param options - Configuration options
 */
export function useScrollVideo(
  scrollProgress: MotionValue<number>,
  options: {
    /** Fraction of the video to play (default: 1 = full video) */
    playbackRange?: number;
    /** Offset into the video in seconds to start from (default: 0) */
    startOffset?: number;
  } = {},
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number>(0);
  const isReadyRef = useRef(false);
  const pendingTimeRef = useRef<number | null>(null);

  const { playbackRange = 1, startOffset = 0 } = options;

  const applySeek = useCallback((video: HTMLVideoElement, targetTime: number) => {
    if (video.seeking) {
      pendingTimeRef.current = targetTime;
      return;
    }

    // Small threshold check to avoid micro-seeking on identical frames
    if (Math.abs(video.currentTime - targetTime) > 0.02) {
      try {
        video.currentTime = targetTime;
      } catch {
        // Fallback for browsers temporarily in invalid state
        pendingTimeRef.current = targetTime;
      }
    }
  }, []);

  const syncTime = useCallback(
    (progress: number) => {
      const video = videoRef.current;
      if (!video || !isReadyRef.current || !isFinite(video.duration) || video.duration === 0) {
        return;
      }

      const targetTime = startOffset + progress * video.duration * playbackRange;
      const clampedTime = Math.max(0, Math.min(targetTime, video.duration));

      applySeek(video, clampedTime);
    },
    [playbackRange, startOffset, applySeek],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Configure video for silent, purely scroll-driven playback
    video.pause();
    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.preload = "auto";

    const handleReady = () => {
      isReadyRef.current = true;
      syncTime(scrollProgress.get());
    };

    const handleSeeked = () => {
      if (pendingTimeRef.current !== null && video && isFinite(video.duration)) {
        const nextTime = pendingTimeRef.current;
        pendingTimeRef.current = null;
        applySeek(video, nextTime);
      }
    };

    video.addEventListener("seeked", handleSeeked);

    if (video.readyState >= 2) {
      handleReady();
    } else {
      video.addEventListener("loadeddata", handleReady, { once: true });
      video.addEventListener("canplay", handleReady, { once: true });
    }

    // Subscribe to scroll progress updates
    const unsubscribe = scrollProgress.on("change", (latest) => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        syncTime(latest);
      });
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(rafIdRef.current);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
    };
  }, [scrollProgress, syncTime, applySeek]);

  return videoRef;
}
