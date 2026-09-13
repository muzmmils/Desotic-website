"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  MotionValue,
} from "framer-motion";
import { CalendarDays, ChefHat, Truck, LucideIcon } from "lucide-react";

interface StepData {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
}

const steps: StepData[] = [
  {
    number: "01",
    title: "Choose Your Plan",
    description:
      "Pick from 3 curated meal plans — Starter, Power, or Ultimate. Set your dietary goals, calorie targets, and delivery schedule.",
    icon: CalendarDays,
    iconColorClass: "text-primary",
  },
  {
    number: "02",
    title: "We Prep Fresh Daily",
    description:
      "Every morning, our chefs prepare your meals with locally sourced ingredients. Cold-pressed, never stored, never preserved.",
    icon: ChefHat,
    iconColorClass: "text-gold",
  },
  {
    number: "03",
    title: "Delivered to Your Door",
    description:
      "Fresh meals delivered across Pune in insulated packaging. Choose your preferred delivery slot — morning, lunch, or dinner.",
    icon: Truck,
    iconColorClass: "text-[var(--coral)]",
  },
];

const StepView = ({
  step,
  index,
  progress,
}: {
  step: StepData;
  index: number;
  progress: MotionValue<number>;
}) => {
  const shouldReduceMotion = useReducedMotion();

  let opacityInput: number[], opacityOutput: number[], scaleOutput: number[], yOutput: number[];

  if (index === 0) {
    opacityInput = [0, 0.2, 0.33];
    opacityOutput = [1, 1, 0];
    scaleOutput = [1, 1, 0.85];
    yOutput = [0, 0, -30];
  } else if (index === 1) {
    opacityInput = [0, 0.2, 0.33, 0.53, 0.66];
    opacityOutput = [0, 0, 1, 1, 0];
    scaleOutput = [0.85, 0.85, 1, 1, 0.85];
    yOutput = [30, 30, 0, 0, -30];
  } else {
    opacityInput = [0, 0.53, 0.66, 1];
    opacityOutput = [0, 0, 1, 1];
    scaleOutput = [0.85, 0.85, 1, 1];
    yOutput = [30, 30, 0, 0];
  }

  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const scale = useTransform(progress, opacityInput, scaleOutput);
  const y = useTransform(progress, opacityInput, yOutput);

  // Parallax for the massive number
  let numberYInput = [0, 1];
  const numberYOutput = [50, -50];
  if (index === 0) {
    numberYInput = [0, 0.33];
  } else if (index === 1) {
    numberYInput = [0.33, 0.66];
  } else {
    numberYInput = [0.66, 1];
  }
  const numberY = useTransform(progress, numberYInput, numberYOutput);

  if (shouldReduceMotion) {
    return (
      <div className="py-16 border-b border-white/10 last:border-0 relative">
        <div className="absolute top-8 right-0 text-8xl md:text-9xl font-serif font-bold text-primary/10 select-none pointer-events-none">
          {step.number}
        </div>
        <step.icon className={`w-12 h-12 mb-6 ${step.iconColorClass}`} />
        <h3 className="text-3xl font-serif font-bold mb-4 text-foreground">{step.title}</h3>
        <p className="text-lg text-foreground/70 max-w-xl">{step.description}</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center will-change-transform"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center pointer-events-none">
        <motion.div
          style={{ y: numberY }}
          className="text-[15rem] md:text-[25rem] font-serif font-bold text-primary/10 select-none leading-none tracking-tighter"
        >
          {step.number}
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto px-6">
        <div className="p-5 rounded-full bg-surface border border-white/5 mb-8 backdrop-blur-md shadow-2xl">
          <step.icon className={`w-12 h-12 md:w-16 md:h-16 ${step.iconColorClass}`} />
        </div>
        <h3 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-foreground tracking-tight drop-shadow-lg">
          {step.title}
        </h3>
        <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed max-w-2xl drop-shadow-md">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
};

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      aria-label="How It Works"
      className={shouldReduceMotion ? "py-32 bg-background" : "relative h-[220vh] bg-background"}
    >
      {shouldReduceMotion ? (
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-center mb-24 text-foreground tracking-tight">
            How It Works
          </h2>
          <div className="flex flex-col">
            {steps.map((step, index) => (
              <StepView key={step.number} step={step} index={index} progress={smoothProgress} />
            ))}
          </div>
        </div>
      ) : (
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
          {/* Header & Progress */}
          <div className="absolute top-0 left-0 right-0 pt-24 z-20 flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-center text-foreground mb-8 tracking-tight">
              How It Works
            </h2>
            <div className="w-full max-w-xs md:max-w-md h-[2px] bg-white/10 relative rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 bottom-0 bg-primary origin-left w-full rounded-full"
                style={{ scaleX: smoothProgress }}
              />
            </div>
          </div>

          {/* Steps Content Area */}
          <div className="flex-1 w-full relative">
            {steps.map((step, index) => (
              <StepView key={step.number} step={step} index={index} progress={smoothProgress} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
