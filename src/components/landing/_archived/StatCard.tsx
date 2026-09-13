import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

export type Stat = {
  /** Numeric value to count up to. Omit for text-only stats. */
  value?: number;
  prefix?: string;
  suffix?: string;
  /** Shown instead of the count-up when `value` is undefined. */
  text?: string;
  label: string;
};

export function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { ref, value } = useCountUp(stat.value ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex-1 rounded-xl border border-border bg-surface px-4 py-5 text-center"
    >
      <span ref={ref} className="block text-2xl font-bold text-gold sm:text-3xl">
        {stat.value !== undefined ? `${stat.prefix ?? ""}${value}${stat.suffix ?? ""}` : stat.text}
      </span>
      <span className="mt-1 block text-xs tracking-wide text-muted-foreground uppercase">
        {stat.label}
      </span>
    </motion.div>
  );
}

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}
