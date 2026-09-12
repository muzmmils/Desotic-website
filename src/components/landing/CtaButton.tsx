import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function CtaButton({ to, children }: { to: "/menu"; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="inline-block"
      {...(reduceMotion
        ? {}
        : {
            animate: { scale: [1, 1.05, 1] },
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
          })}
      whileHover={{ scale: 1.06 }}
      whileFocus={{ scale: 1.06 }}
      style={{ willChange: "transform" }}
    >
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_var(--primary-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {children}
      </Link>
    </motion.div>
  );
}
