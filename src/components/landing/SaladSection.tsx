import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { DishImage } from "./DishImage";
import type { AccentSpec } from "./FloatingAccent";
import { StatsRow, type Stat } from "./StatCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SALAD_IMAGE, INGREDIENTS } from "@/lib/placeholders";

const ACCENTS: AccentSpec[] = [
  {
    image: INGREDIENTS.olive,
    label: "Olives",
    top: "16%",
    left: "-14%",
    size: 104,
    fromX: -260,
    fromY: -20,
    fromRotate: -40,
    restRotate: -8,
    parallax: 34,
    range: [0.15, 0.5],
  },
  {
    image: INGREDIENTS.tomato,
    label: "Cherry tomato",
    top: "56%",
    left: "82%",
    size: 118,
    fromX: 260,
    fromY: 20,
    fromRotate: 45,
    restRotate: 10,
    parallax: 52,
    range: [0.18, 0.53],
  },
  {
    image: INGREDIENTS.carrotJulienne,
    label: "Carrot shreds",
    top: "-12%",
    left: "68%",
    size: 108,
    fromX: 190,
    fromY: -70,
    fromRotate: 35,
    restRotate: -6,
    parallax: 26,
    range: [0.2, 0.55],
  },
  {
    image: INGREDIENTS.lettuce,
    label: "Lettuce",
    top: "78%",
    left: "-6%",
    size: 112,
    fromX: -190,
    fromY: 70,
    fromRotate: -35,
    restRotate: 12,
    parallax: 44,
    range: [0.16, 0.52],
  },
  {
    image: INGREDIENTS.sesame,
    label: "Sesame seeds",
    top: "-10%",
    left: "16%",
    size: 88,
    fromX: -40,
    fromY: -150,
    fromRotate: 120,
    parallax: 18,
    range: [0.17, 0.54],
  },
  {
    image: INGREDIENTS.pomegranate,
    label: "Pomegranate",
    top: "84%",
    left: "60%",
    size: 92,
    fromX: 40,
    fromY: 150,
    fromRotate: -60,
    restRotate: 8,
    parallax: 38,
    range: [0.19, 0.55],
  },
];

const STATS: Stat[] = [
  { value: 38, suffix: "g", label: "Protein" },
  { value: 0, label: "Added Sugar" },
  { value: 100, suffix: "%", label: "Fresh" },
];

export function SaladSection() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const isStatic = Boolean(reduceMotion);
  const accents = isMobile ? ACCENTS.slice(0, 3) : ACCENTS;

  return (
    <section
      ref={ref}
      className="flex min-h-screen items-center px-6 py-20 md:px-12 md:py-20"
      aria-labelledby="salad-title"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-20">
        <DishImage
          src={SALAD_IMAGE}
          alt="Greek Chicken Salad with grilled chicken, cherry tomatoes and pomegranate"
          progress={scrollYProgress}
          accents={accents}
          isStatic={isStatic}
          rotateRange={[-16, 10]}
          tiltRange={[12, -6]}
        />

        <div className="flex flex-col gap-6">
          <motion.h2
            id="salad-title"
            className="text-4xl font-extrabold text-primary"
            initial={isStatic ? false : { opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6 }}
          >
            Greek Chicken Salad
          </motion.h2>

          <motion.p
            className="text-lg leading-relaxed text-foreground"
            initial={isStatic ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Grilled chicken steak slices with exotic julienned vegetables, cherry tomatoes,
            pomegranate, raisins, olives — topped with white and black sesame.
          </motion.p>

          <StatsRow stats={STATS} />
        </div>
      </div>
    </section>
  );
}
