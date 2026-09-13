import { useRef } from "react";
import { useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

// Framer Motion scroll offset type (not exported, so we define it here)
type ScrollOffsetTuple = [string, string];

/**
 * Smooth spring-dampened scroll progress for cinematic scroll-driven animations.
 *
 * Wraps `useScroll` with `useSpring` to give scroll transforms momentum and
 * weight, preventing the ratcheting feel of raw scroll events on mouse wheels.
 */
export function useSmoothScroll(
  targetRef: React.RefObject<HTMLElement | null>,
  offset: ScrollOffsetTuple = ["start end", "end start"],
  springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 },
) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: offset as any,
  });

  const smoothProgress = useSpring(scrollYProgress, springConfig);

  return { scrollYProgress, smoothProgress };
}

/**
 * Creates a pair of scroll-synced transforms with spring smoothing.
 * Convenience wrapper over useSmoothScroll + useTransform.
 */
export function useSmoothTransform<T>(
  scrollYProgress: MotionValue<number>,
  inputRange: number[],
  outputRange: T[],
  springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 },
) {
  const springValue = useSpring(scrollYProgress, springConfig);
  const transformed = useTransform(springValue, inputRange, outputRange);
  return transformed;
}

/**
 * Quick helper: scroll + smooth + auto-ref.
 * Returns a ref to attach and the smooth progress value.
 */
export function usePinnedScroll(offset: ScrollOffsetTuple = ["start start", "end end"]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return { ref, scrollYProgress, smoothProgress };
}
