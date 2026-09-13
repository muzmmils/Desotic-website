import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CtaButton } from "./CtaButton";

const TITLE = "Infinite Healthy Yumm";
const SHAPES = ["50%", "50% 0 50% 50%", "60% 40% 55% 45%"];

type Particle = {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  dx: number;
  dy: number;
  radius: string;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 4 + Math.random() * 14,
    duration: 15 + Math.random() * 25,
    delay: -Math.random() * 20,
    opacity: 0.08 + Math.random() * 0.07,
    dx: (Math.random() - 0.5) * 160,
    dy: (Math.random() - 0.5) * 200,
    radius: SHAPES[Math.floor(Math.random() * SHAPES.length)] as string,
  }));
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  // Generated after mount only: random values would hydration-mismatch on SSR.
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(makeParticles(window.innerWidth < 768 ? 10 : 18));
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const letters = TITLE.split("");
  const titleDuration = letters.length * 0.04 + 0.5;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle bg-primary"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              borderRadius: p.radius,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ["--dx" as string]: `${p.dx}px`,
              ["--dy" as string]: `${p.dy}px`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        style={reduceMotion ? {} : { y: parallaxY, opacity: fade, willChange: "transform" }}
      >
        <h1
          className="font-extrabold tracking-tight text-primary"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 1.05 }}
        >
          <span className="sr-only">{TITLE}</span>
          <span aria-hidden="true">
            {letters.map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                className="inline-block"
                initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.04 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
          <motion.span
            className="mt-3 block font-bold tracking-[0.2em] text-foreground uppercase"
            style={{ fontSize: "clamp(0.7rem, 2vw, 1rem)" }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: reduceMotion ? 0 : titleDuration + 0.4 }}
          >
            Healthy Cafe in Moshi, Pune
          </motion.span>
        </h1>

        <motion.p
          className="mt-6 font-normal text-foreground italic"
          style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)" }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: reduceMotion ? 0 : titleDuration + 0.8 }}
        >
          Healthy bhi! Tasty bhi!
        </motion.p>

        <motion.div
          className="mt-10"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : titleDuration + 1.2 }}
        >
          <CtaButton to="/menu">Explore Menu</CtaButton>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary"
        aria-hidden="true"
        {...(reduceMotion
          ? {}
          : {
              animate: { y: [0, 8, 0] },
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
            })}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}
