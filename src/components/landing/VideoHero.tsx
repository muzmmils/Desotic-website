"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import heroVideo from "@/assets/Farm to Bowl.mp4";
import { useScrollVideo } from "@/hooks/useScrollVideo";

export function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Sync video playback frame-by-frame with scroll progress
  const videoRef = useScrollVideo(smoothProgress);

  const prefersReducedMotion = useReducedMotion();

  // Parallax and scale transforms
  const textY = useTransform(smoothProgress, [0, 1], ["0%", "-35%"]);
  const textOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const videoScale = useTransform(smoothProgress, [0, 1], [1, 1.08]);
  const indicatorOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);

  const y = prefersReducedMotion ? "0%" : textY;
  const opacity = prefersReducedMotion ? 1 : textOpacity;

  return (
    <section ref={containerRef} aria-label="Hero" className="relative h-[160vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        {/* Scrubbed Video Background */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          style={{ scale: prefersReducedMotion ? 1 : videoScale }}
        >
          <video
            ref={videoRef}
            src={heroVideo}
            muted
            playsInline
            preload="auto"
            className="object-cover w-full h-full absolute inset-0"
          />
        </motion.div>

        {/* Top gradient */}
        <div
          className="absolute inset-x-0 top-0 h-1/3 pointer-events-none z-[1]"
          style={{ background: "var(--gradient-video-top)" }}
        />
        {/* Bottom gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-[1]"
          style={{ background: "var(--gradient-video-bottom)" }}
        />

        {/* Content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-10 will-change-transform px-4"
          style={{ y, opacity }}
        >
          <div className="inline-block mb-3 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            Freshly Harvested · Zero Preservatives
          </div>
          <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-gradient text-center">
            DESOTIQ
          </h1>
          <p className="font-sans uppercase tracking-[0.3em] text-foreground/70 mt-4 sm:mt-6 text-sm sm:text-base text-center">
            Eat Clean. Live Bold.
          </p>
          <Link
            to="/subscriptions"
            className="mt-8 sm:mt-12 rounded-full bg-primary text-primary-foreground px-8 py-4 font-sans font-semibold hover:scale-105 transition-transform glow-pulse flex items-center gap-2 shadow-lg"
          >
            First Box Free →
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: prefersReducedMotion ? 0.7 : indicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-foreground pointer-events-none flex flex-col items-center gap-1"
        >
          <span className="text-[11px] uppercase tracking-widest text-foreground/60 font-mono">
            Scroll to explore
          </span>
          <ChevronDown className="w-6 h-6 animate-bounce opacity-70 text-primary" />
        </motion.div>
      </div>
    </section>
  );
}
