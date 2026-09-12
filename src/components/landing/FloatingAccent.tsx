import { motion, useTransform, type MotionValue } from "framer-motion";

export type AccentSpec = {
  /** Transparent-PNG ingredient cutout. */
  image: string;
  label: string;
  /** Final position, as CSS percentages relative to the image wrapper. */
  top: string;
  left: string;
  size: number;
  fromX: number;
  fromY: number;
  fromRotate: number;
  /** scrollYProgress range over which this accent flies in. */
  range: [number, number];
  /** Extra parallax drift (px) applied across the whole section scroll. */
  parallax?: number;
  /** Resting tilt in degrees. */
  restRotate?: number;
};

export function FloatingAccent({
  spec,
  progress,
  isStatic,
}: {
  spec: AccentSpec;
  progress: MotionValue<number>;
  isStatic: boolean;
}) {
  const rest = spec.restRotate ?? 0;
  const drift = spec.parallax ?? 0;

  const x = useTransform(progress, spec.range, [spec.fromX, 0]);
  const y = useTransform(
    progress,
    [0, spec.range[0], spec.range[1], 1],
    [spec.fromY, spec.fromY, 0, -drift],
  );
  const rotate = useTransform(
    progress,
    [spec.range[0], spec.range[1], 1],
    [spec.fromRotate, rest, rest + drift * 0.12],
  );
  const opacity = useTransform(
    progress,
    [spec.range[0], spec.range[0] + 0.1, spec.range[1]],
    [0, 0.7, 1],
  );

  return (
    <motion.div
      aria-hidden="true"
      title={spec.label}
      className="pointer-events-none absolute"
      style={{
        top: spec.top,
        left: spec.left,
        width: spec.size,
        height: spec.size,
        ...(isStatic
          ? { transform: `rotate(${rest}deg)` }
          : { x, y, rotate, opacity, willChange: "transform, opacity" }),
      }}
    >
      <img
        src={spec.image}
        alt=""
        loading="lazy"
        width={512}
        height={512}
        className="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
      />
    </motion.div>
  );
}
