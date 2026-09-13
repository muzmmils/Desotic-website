import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { DishImage } from "./DishImage";
import type { AccentSpec } from "./FloatingAccent";
import { StatsRow, type Stat } from "./StatCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { OATMEAL_IMAGE, INGREDIENTS } from "@/lib/placeholders";

const ACCENTS: AccentSpec[] = [
  {
    image: INGREDIENTS.nuts,
    label: "Mixed nuts",
    top: "20%",
    left: "-15%",
    size: 116,
    fromX: -260,
    fromY: 0,
    fromRotate: -40,
    restRotate: -8,
    parallax: 38,
    range: [0.15, 0.5],
  },
  {
    image: INGREDIENTS.chocolate,
    label: "Dark chocolate",
    top: "60%",
    left: "84%",
    size: 112,
    fromX: 260,
    fromY: 0,
    fromRotate: 40,
    restRotate: 10,
    parallax: 50,
    range: [0.18, 0.53],
  },
  {
    image: INGREDIENTS.seeds,
    label: "Seeds",
    top: "-12%",
    left: "26%",
    size: 96,
    fromX: 0,
    fromY: -160,
    fromRotate: 120,
    parallax: 22,
    range: [0.17, 0.52],
  },
  {
    image: INGREDIENTS.barley,
    label: "Talbina barley",
    top: "82%",
    left: "12%",
    size: 104,
    fromX: -80,
    fromY: 150,
    fromRotate: -50,
    restRotate: 14,
    parallax: 44,
    range: [0.2, 0.55],
  },
];

const LAYERS = [
  "Talbina (barley) base",
  "Crunchy muesli layer",
  "Mixed nuts & seeds",
  "Dark chocolate chunks",
];

const STATS: Stat[] = [
  { value: 42, suffix: "g", label: "Protein" },
  { value: 12, suffix: "g", label: "Fiber" },
  { text: "Made", label: "Fresh" },
];

export function OatmealSection() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const isStatic = Boolean(reduceMotion);

  return (
    <section
      ref={ref}
      className="flex min-h-screen items-center px-6 py-20 md:px-12 md:py-20"
      aria-labelledby="oatmeal-title"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <DishImage
          src={OATMEAL_IMAGE}
          alt="Power oatmeal bowl with talbina base, muesli, nuts and dark chocolate"
          progress={scrollYProgress}
          accents={isMobile ? ACCENTS.slice(0, 3) : ACCENTS}
          isStatic={isStatic}
          rotateRange={[-20, 14]}
          tiltRange={[10, -8]}
          scaleFrom={0.6}
          glow="var(--shadow-dish-lg)"
        />

        <motion.h2
          id="oatmeal-title"
          className="text-4xl font-extrabold text-primary"
          initial={isStatic ? false : { opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6 }}
        >
          Power Oatmeal Bowl
        </motion.h2>

        <div className="flex w-full flex-col items-center gap-3">
          {LAYERS.map((layer, i) => (
            <motion.span
              key={layer}
              className="w-full max-w-sm rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground"
              initial={isStatic ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.15 }}
            >
              {layer}
            </motion.span>
          ))}
        </div>

        <div className="w-full">
          <StatsRow stats={STATS} />
        </div>
      </div>
    </section>
  );
}
