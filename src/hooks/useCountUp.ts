import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Animates a number from 0 to `target` over `duration` ms once the returned
 * ref enters the viewport. Respects prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 1500) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion || duration <= 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration, reduceMotion]);

  return { ref, value };
}
