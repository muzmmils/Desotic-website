"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";

export function ProblemPromise() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll tracking across container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Phase 1: Problem Text (0 -> 0.45)
  const problemMaskX = useTransform(smoothProgress, [0.05, 0.28], ["0%", "101%"]);
  const problemOpacity = useTransform(smoothProgress, [0.32, 0.46], [1, 0]);

  // Phase 2: Divider (0.4 -> 0.58)
  const dividerScaleX = useTransform(smoothProgress, [0.4, 0.56], [0, 1]);

  // Phase 3: Promise Text (0.45 -> 0.9)
  const promiseMaskX = useTransform(smoothProgress, [0.52, 0.85], ["0%", "-101%"]);
  const promiseOpacity = useTransform(smoothProgress, [0.46, 0.56], [0, 1]);
  const glowOpacity = useTransform(smoothProgress, [0.5, 0.9], [0, 1]);

  return (
    <section
      aria-label="Our Promise"
      ref={containerRef}
      className="relative h-[180vh] bg-background"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Glow Background */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ opacity: prefersReducedMotion ? 1 : glowOpacity }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] max-w-3xl rounded-full bg-[var(--hero-glow)] opacity-20 blur-[100px]" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-6 text-center">
          {/* Problem Section */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-full flex justify-center"
            style={{ opacity: prefersReducedMotion ? 0 : problemOpacity }}
          >
            <div className="relative overflow-hidden inline-block">
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                Tired of boring diet food?
              </h2>
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-background will-change-transform"
                  style={{ x: problemMaskX }}
                />
              )}
            </div>
          </motion.div>

          {/* Divider & Promise Section */}
          <motion.div
            className="w-full flex flex-col items-center gap-8"
            style={{ opacity: prefersReducedMotion ? 1 : promiseOpacity }}
          >
            {/* Horizontal Divider */}
            <motion.div
              className="h-px w-24 bg-primary will-change-transform"
              style={{ scaleX: prefersReducedMotion ? 1 : dividerScaleX }}
            />

            {/* Promise Header */}
            <div className="relative overflow-hidden inline-block">
              <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-foreground">
                Real food. <span className="text-primary">Delivered daily.</span>
              </h2>
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-background will-change-transform origin-right"
                  style={{ x: promiseMaskX }}
                />
              )}
            </div>

            {/* Promise Subtext */}
            <div className="relative overflow-hidden inline-block mt-4">
              <p className="font-sans text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
                Fresh, chef-crafted salad bowls delivered to your doorstep in Pune
              </p>
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-background will-change-transform"
                  style={{ x: promiseMaskX }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
