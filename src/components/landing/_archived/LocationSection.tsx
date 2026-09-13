import { motion, useReducedMotion } from "framer-motion";

const ADDRESS = "High Street Mall, Moshi, Pimpri-Chinchwad, Pune 412105";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("High Street Mall, Moshi, Pimpri-Chinchwad, Pune 412105");
const MAP_EMBED =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("High Street Mall, Moshi, Pimpri-Chinchwad, Pune 412105") +
  "&output=embed";

export function LocationSection() {
  const reduceMotion = useReducedMotion();
  const isStatic = Boolean(reduceMotion);

  return (
    <section
      className="flex min-h-screen items-center px-6 py-20 md:px-12 md:py-20"
      aria-labelledby="location-title"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={isStatic ? false : { opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl border border-border"
        >
          <iframe
            title="Map to Infinite Healthy Yumm, High Street Mall Moshi"
            src={MAP_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full border-0 md:h-[420px]"
          />
        </motion.div>

        <motion.div
          initial={isStatic ? false : { opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h2 id="location-title" className="text-3xl font-extrabold text-primary">
            Visit Us
          </h2>
          <ul className="mt-6 flex flex-col gap-4 text-foreground">
            <li className="flex gap-3">
              <span aria-hidden="true">📍</span>
              <span>{ADDRESS}</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">🕐</span>
              <span>Open Daily: 9:00 AM – 10:00 PM</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">📞</span>
              <a href="tel:+910000000000" className="text-muted-foreground hover:text-primary">
                +91 00000 00000
              </a>
            </li>
          </ul>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_var(--primary-glow)]"
          >
            Get Directions
          </a>
        </motion.div>
      </div>
    </section>
  );
}
