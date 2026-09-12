import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { DishImage } from "./DishImage";
import type { AccentSpec } from "./FloatingAccent";
import { StatsRow, type Stat } from "./StatCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { JUICE_IMAGE, INGREDIENTS } from "@/lib/placeholders";

const ACCENTS: AccentSpec[] = [
  {
    image: INGREDIENTS.apple,
    label: "Apple slice",
    top: "12%",
    left: "-14%",
    size: 112,
    fromX: -260,
    fromY: -50,
    fromRotate: -45,
    restRotate: -10,
    parallax: 40,
    range: [0.15, 0.5],
  },
  {
    image: INGREDIENTS.beetroot,
    label: "Beetroot half",
    top: "66%",
    left: "80%",
    size: 122,
    fromX: 260,
    fromY: 50,
    fromRotate: 45,
    restRotate: 12,
    parallax: 54,
    range: [0.18, 0.53],
  },
  {
    image: INGREDIENTS.carrot,
    label: "Carrot",
    top: "-12%",
    left: "58%",
    size: 116,
    fromX: 0,
    fromY: -160,
    fromRotate: 140,
    restRotate: -18,
    parallax: 24,
    range: [0.2, 0.55],
  },
];

const STATS: Stat[] = [
  { value: 0, label: "Preservatives" },
  { value: 100, suffix: "%", label: "Fruit" },
  { text: "Made", label: "To Order" },
];

const QUOTE_LINES = ["Pressed in-house.", "Never stored.", "Never preserved."];

export function JuiceSection() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const isStatic = Boolean(reduceMotion);

  return (
    <section
      ref={ref}
      className="flex min-h-screen items-center px-6 py-20 md:px-12 md:py-20"
      aria-labelledby="juice-title"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-20">
        <div className="order-1 md:order-2">
          <DishImage
            src={JUICE_IMAGE}
            alt="Cold-pressed ABC juice made from apple, beetroot and carrot"
            progress={scrollYProgress}
            accents={isMobile ? ACCENTS.slice(0, 3) : ACCENTS}
            isStatic={isStatic}
            rotateRange={[10, -8]}
            tiltRange={[-14, 8]}
          />
        </div>

        <div className="order-2 flex flex-col gap-6 md:order-1">
          <motion.h2
            id="juice-title"
            className="text-4xl font-extrabold text-primary"
            initial={isStatic ? false : { opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6 }}
          >
            Cold-Pressed ABC Juice
          </motion.h2>

          <motion.p
            className="text-lg leading-relaxed text-foreground"
            initial={isStatic ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Apple, beetroot &amp; carrot — cold-pressed in-house to order. Never stored. Never
            preserved.
          </motion.p>

          <div className="flex flex-col gap-1">
            {QUOTE_LINES.map((line, i) => (
              <motion.span
                key={line}
                className="text-xl font-bold text-muted-foreground italic"
                initial={isStatic ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.3 }}
              >
                {line}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="w-fit rounded-full border border-primary px-5 py-2 text-sm font-bold tracking-wide text-primary"
            style={{ boxShadow: "var(--shadow-glow)" }}
            initial={isStatic ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            🟢 COLD-PRESSED IN-HOUSE
          </motion.div>

          <StatsRow stats={STATS} />
        </div>
      </div>
    </section>
  );
}
