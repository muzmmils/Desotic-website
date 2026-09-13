import { motion, useTransform, type MotionValue } from "framer-motion";
import { FloatingAccent, type AccentSpec } from "./FloatingAccent";

export function DishImage({
  src,
  alt,
  progress,
  accents,
  isStatic,
  scaleFrom = 0.7,
  glow = "var(--shadow-dish)",
  rotateRange = [-18, 12],
  tiltRange = [10, -6],
}: {
  src: string;
  alt: string;
  progress: MotionValue<number>;
  accents: AccentSpec[];
  isStatic: boolean;
  scaleFrom?: number;
  glow?: string;
  /** In-plane rotation across the section scroll, in degrees. */
  rotateRange?: [number, number];
  /** Subtle 3D Y-axis tilt across the section scroll, in degrees. */
  tiltRange?: [number, number];
}) {
  const scale = useTransform(progress, [0.1, 0.5], [scaleFrom, 1]);
  const opacity = useTransform(progress, [0.1, 0.5], [0, 1]);
  const rotate = useTransform(progress, [0, 1], rotateRange);
  const rotateY = useTransform(progress, [0, 1], tiltRange);
  const y = useTransform(progress, [0, 1], [40, -40]);
  const glowScale = useTransform(progress, [0.1, 0.6], [0.6, 1]);
  const glowOpacity = useTransform(progress, [0.1, 0.5, 0.9], [0, 0.9, 0.5]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" style={{ perspective: 1200 }}>
      <motion.div
        aria-hidden="true"
        className="absolute inset-6 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
          filter: "blur(40px)",
          ...(isStatic ? {} : { scale: glowScale, opacity: glowOpacity }),
        }}
      />
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        width={1024}
        height={1024}
        className="relative h-full w-full rounded-3xl object-cover"
        style={{
          boxShadow: glow,
          transformStyle: "preserve-3d",
          ...(isStatic
            ? {}
            : { scale, opacity, rotate, rotateY, y, willChange: "transform, opacity" }),
        }}
      />
      {accents.map((spec) => (
        <FloatingAccent key={spec.label} spec={spec} progress={progress} isStatic={isStatic} />
      ))}
    </div>
  );
}
