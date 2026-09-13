"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Link } from "@tanstack/react-router";
import saladVideo from "@/assets/Assembling_chicken_and_avocado_bowl.mp4";
import juiceVideo from "@/assets/Cold-Pressed Juice — The Pour.mp4";
import oatmealImg from "@/assets/dish-oatmeal.jpg";

interface ProductItem {
  title: string;
  subtitle: string;
  tag: string;
  type: "video" | "image" | "cta";
  mediaSrc?: string;
}

const products: ProductItem[] = [
  {
    title: "Signature Salad & Protein Bowls",
    subtitle: "38g Protein · Chef-assembled daily with farm-fresh greens",
    tag: "High Protein",
    type: "video",
    mediaSrc: saladVideo,
  },
  {
    title: "Cold-Pressed Pure Elixirs",
    subtitle: "0 Preservatives · 100% Raw fruit & botanical extracts",
    tag: "100% Raw",
    type: "video",
    mediaSrc: juiceVideo,
  },
  {
    title: "Power Oatmeal Bowls",
    subtitle: "42g Clean Carbs & Whey · 12g Dietary prebiotic fiber",
    tag: "Morning Fuel",
    type: "image",
    mediaSrc: oatmealImg,
  },
  {
    title: "All of this. Delivered daily.",
    subtitle: "Starting at ₹2,499/month across Pune",
    tag: "Subscription",
    type: "cta",
  },
];

interface ProductCardProps {
  product: ProductItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  prefersReducedMotion: boolean | null;
}

function ProductCard({ product, index, total, progress, prefersReducedMotion }: ProductCardProps) {
  const start = Math.max(0, (index - 0.45) / (total - 1));
  const peak = index / (total - 1);
  const end = Math.min(1, (index + 0.45) / (total - 1));

  const scale = useTransform(progress, [start, peak, end], [0.92, 1, 0.92]);
  const opacity = useTransform(progress, [start, peak, end], [0.35, 1, 0.35]);

  return (
    <div className="w-screen h-screen relative flex items-center justify-center p-6 md:p-12 shrink-0">
      <motion.div
        style={{
          scale: prefersReducedMotion ? 1 : scale,
          opacity: prefersReducedMotion ? 1 : opacity,
        }}
        className="relative w-full max-w-5xl h-[75vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-surface flex flex-col justify-end will-change-transform"
      >
        {/* Media Background */}
        {product.type === "video" && product.mediaSrc ? (
          <video
            src={product.mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : product.type === "image" && product.mediaSrc ? (
          <img
            src={product.mediaSrc}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-surface to-background" />
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

        {/* Content Box */}
        <div className="relative z-10 p-8 sm:p-12 max-w-3xl">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 mb-4">
            {product.tag}
          </span>
          <h3 className="font-serif text-3xl sm:text-5xl md:text-6xl text-foreground font-bold mb-4 tracking-tight drop-shadow-xl">
            {product.title}
          </h3>
          <p className="font-sans text-base sm:text-xl text-foreground/80 mb-8 max-w-2xl drop-shadow-md leading-relaxed">
            {product.subtitle}
          </p>
          {product.type === "cta" ? (
            <Link
              to="/subscriptions"
              className="inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-bold rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-lg shadow-primary/25"
            >
              Start Your Free Box →
            </Link>
          ) : (
            <Link
              to="/menu"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-foreground hover:bg-white/10 transition-colors"
            >
              View Nutrition Details
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ProgressBarItem({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = Math.max(0, (index - 0.4) / (total - 1));
  const peak = index / (total - 1);
  const end = Math.min(1, (index + 0.4) / (total - 1));
  const opacity = useTransform(progress, [start, peak, end], [0.2, 1, 0.2]);

  return (
    <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden relative">
      <motion.div className="absolute inset-0 bg-primary" style={{ opacity }} />
    </div>
  );
}

export function ProductShowcase() {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Shift across the 4 slides: 0% to -75%
  const totalShift = ((products.length - 1) / products.length) * 100;
  const x = useTransform(smoothProgress, [0, 1], ["0%", `-${totalShift}%`]);

  if (prefersReducedMotion) {
    return (
      <section aria-label="Our Products" className="py-20 flex flex-col gap-12 bg-background px-6">
        {products.map((product, index) => (
          <div
            key={index}
            className="relative min-h-[60vh] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-end p-8"
          >
            {product.type === "video" && product.mediaSrc ? (
              <video
                src={product.mediaSrc}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : product.type === "image" && product.mediaSrc ? (
              <img
                src={product.mediaSrc}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="relative z-10">
              <h3 className="font-serif text-3xl font-bold text-foreground mb-2">
                {product.title}
              </h3>
              <p className="text-foreground/80 mb-6">{product.subtitle}</p>
              {product.type === "cta" && (
                <Link
                  to="/subscriptions"
                  className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold"
                >
                  See Plans →
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      aria-label="Our Products"
      className="relative h-[280vh] bg-background"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Horizontal Sliding Filmstrip */}
        <motion.div
          className="flex h-full will-change-transform"
          style={{ width: `${products.length * 100}vw`, x }}
        >
          {products.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              index={index}
              total={products.length}
              progress={smoothProgress}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>

        {/* Dynamic Progress Indicator */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20 pointer-events-none">
          {products.map((_, index) => (
            <ProgressBarItem
              key={index}
              index={index}
              total={products.length}
              progress={smoothProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
