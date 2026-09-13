"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import ctaVideo from "@/assets/Assembling_chicken_and_avocado_bowl.mp4";

export function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 30,
      },
    },
  };

  return (
    <section
      aria-label="Start Your Trial"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <video
        src={ctaVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "var(--gradient-video-overlay, linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.6) 50%, var(--background) 100%))",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider bg-[var(--coral)]/15 text-[var(--coral)] border border-[var(--coral)]/30">
              Limited Time Offer
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-foreground mb-6"
          >
            Your First Box is Free
          </motion.h2>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-foreground/70 text-lg sm:text-xl mb-10 max-w-2xl"
          >
            Start your 3-day trial. Cancel anytime. Free delivery across Pune.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-12"
          >
            <Link
              to="/subscriptions"
              className="rounded-full bg-primary text-primary-foreground px-10 py-4 text-lg font-bold glow-pulse hover:scale-105 transition-transform inline-flex items-center justify-center"
            >
              Start My Free Trial &rarr;
            </Link>
            <Link
              to="/menu"
              className="rounded-full border border-foreground/20 text-foreground px-8 py-3 text-base font-semibold hover:border-foreground/40 transition-colors inline-flex items-center justify-center"
            >
              Explore the Menu
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-foreground/70 text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Made Fresh Daily</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
