import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { CtaButton } from "./CtaButton";

const CATEGORIES = [
  { emoji: "🥗", name: "Salads" },
  { emoji: "🧃", name: "Juices" },
  { emoji: "💪", name: "Protein Shakes" },
  { emoji: "🍽️", name: "Protein Meals" },
  { emoji: "🍪", name: "Healthy Snacks" },
  { emoji: "🍫", name: "Desserts" },
];

export function CategorySection() {
  const reduceMotion = useReducedMotion();
  const isStatic = Boolean(reduceMotion);

  return (
    <section
      className="flex min-h-screen flex-col items-center justify-center px-6 py-20 md:px-12 md:py-20"
      aria-labelledby="menu-categories-title"
    >
      <motion.h2
        id="menu-categories-title"
        className="text-3xl font-extrabold text-primary md:text-4xl"
        initial={isStatic ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6 }}
      >
        What&apos;s on the Menu
      </motion.h2>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {CATEGORIES.map((category, i) => (
          <motion.div
            key={category.name}
            initial={isStatic ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            {...(isStatic ? {} : { whileHover: { y: -4 } })}
          >
            <Link
              to="/menu"
              className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-8 text-center transition-all duration-300 hover:border-primary hover:shadow-[0_12px_40px_var(--primary-glow)]"
            >
              <span className="text-4xl" aria-hidden="true">
                {category.emoji}
              </span>
              <span className="font-bold text-foreground">{category.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-14">
        <CtaButton to="/menu">View Full Menu →</CtaButton>
      </div>
    </section>
  );
}
