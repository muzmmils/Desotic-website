"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Quote } from "lucide-react";

function CountUpNumber({
  target,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          let startTimestamp: number;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(easeProgress * target);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [target, prefersReducedMotion]);

  let formatted = count.toFixed(decimals);
  if (decimals === 0) {
    formatted = Math.floor(count).toLocaleString();
  }

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}

const stats = [
  { target: 500, suffix: "+", label: "Active Subscribers", decimals: 0 },
  { target: 15000, suffix: "+", label: "Meals Delivered", decimals: 0 },
  { target: 4.9, suffix: "★", label: "Average Rating", decimals: 1 },
];

const testimonials = [
  {
    quote: "The salads are incredible. I've never been this consistent with healthy eating.",
    author: "Priya S.",
    location: "Hinjewadi",
  },
  {
    quote: "Best cold-pressed juices in Pune. The subscription makes it effortless.",
    author: "Rahul M.",
    location: "Kothrud",
  },
  {
    quote: "My gym performance improved dramatically since I started Desotiq.",
    author: "Ananya K.",
    location: "Wakad",
  },
];

export function SocialProof() {
  return (
    <section
      aria-label="Social Proof"
      className="relative w-full bg-background overflow-hidden py-24 sm:py-32"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
              className="bg-surface border border-border rounded-2xl p-6 sm:p-8 text-center will-change-transform"
            >
              <div className="text-gold font-serif text-4xl sm:text-5xl font-bold mb-2">
                <CountUpNumber target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div className="text-foreground/60 text-sm uppercase tracking-wider font-sans font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              className="bg-surface/50 border border-border/50 rounded-2xl p-6 flex flex-col justify-between will-change-transform"
            >
              <div>
                <Quote className="w-8 h-8 text-primary/40 mb-4" />
                <p className="text-foreground/90 font-serif italic text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
              </div>
              <div>
                <div className="font-sans font-bold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-foreground/60">{testimonial.location}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Delivery Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center will-change-transform"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 text-primary px-6 py-2 text-sm font-semibold">
            <MapPin className="w-4 h-4" />
            <span>Delivering Across Pune</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
