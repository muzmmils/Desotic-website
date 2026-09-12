import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

const PHRASES: { text: string; direction: "ltr" | "rtl"; range: [number, number] }[] = [
  { text: "EVERYTHING MADE TO ORDER.", direction: "ltr", range: [0.15, 0.45] },
  { text: "COLD-PRESSED IN-HOUSE.", direction: "rtl", range: [0.3, 0.6] },
  { text: "POWERED BY REAL INGREDIENTS.", direction: "ltr", range: [0.45, 0.75] },
];

function Phrase({
  text,
  direction,
  range,
  progress,
  isStatic,
}: {
  text: string;
  direction: "ltr" | "rtl";
  range: [number, number];
  progress: MotionValue<number>;
  isStatic: boolean;
}) {
  const maskX = useTransform(
    progress,
    range,
    direction === "ltr" ? ["0%", "-101%"] : ["0%", "101%"],
  );

  return (
    <div className="relative overflow-hidden">
      <p
        className="font-extrabold tracking-tight text-primary"
        style={{
          fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
          lineHeight: 1.1,
        }}
      >
        {text}
      </p>
      {!isStatic && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-philosophy"
          style={{ x: maskX, willChange: "transform" }}
        />
      )}
    </div>
  );
}

function Divider({
  progress,
  range,
  isStatic,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  isStatic: boolean;
}) {
  const scaleX = useTransform(progress, range, [0, 1]);

  return (
    <div className="my-10 h-px w-full" aria-hidden="true">
      <motion.div
        className="h-px w-full origin-left"
        style={{
          background: "var(--primary-line)",
          ...(isStatic ? {} : { scaleX, willChange: "transform" }),
        }}
      />
    </div>
  );
}

export function PhilosophySection() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const isStatic = Boolean(reduceMotion);

  return (
    <section
      ref={ref}
      className="flex min-h-screen items-center bg-philosophy px-6 py-20 md:px-12 md:py-20"
      aria-label="Our philosophy"
    >
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="mb-8 text-sm font-bold tracking-[0.25em] text-foreground uppercase">
          Our Philosophy
        </h2>

        {PHRASES.map((phrase, i) => (
          <div key={phrase.text}>
            <Phrase {...phrase} progress={scrollYProgress} isStatic={isStatic} />
            {i < PHRASES.length - 1 && (
              <Divider
                progress={scrollYProgress}
                range={[phrase.range[1], phrase.range[1] + 0.12]}
                isStatic={isStatic}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
