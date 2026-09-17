import { motion } from "framer-motion";
import { SPRING_SNAP } from "../../lib/motion";

const WIDTH = 640;
const HEIGHT = 150;
const PAD = 48;

// Warm-to-teal palette in the site's family (amber accent -> teal), instead
// of an arbitrary rainbow, so the toy dots read as "part of this system"
// rather than generic chart defaults. Endpoints are the site's actual
// --color-accent/--color-teal tokens; the 3 interpolated stops in between
// have no token equivalent (pure data-viz gradient steps).
const DOT_COLORS = [
  "var(--color-accent)",
  "#e0934a",
  "#c9ab6b",
  "#7fa39c",
  "var(--color-teal)",
];

export function scaleX(value, domain) {
  const [min, max] = domain;
  return PAD + ((value - min) / (max - min)) * (WIDTH - 2 * PAD);
}

// Shared number-line visual used across stages 1-3: an axis with tick marks,
// a set of value dots, an optional mean marker, and an optional shaded
// spread band (mean +/- std) to make "typical distance from center" land
// visually rather than just as arithmetic.
export default function NumberLine({
  values,
  domain,
  meanValue,
  band,
  dotY = HEIGHT / 2,
  showValues = true,
}) {
  const ticks = [];
  for (let t = Math.ceil(domain[0]); t <= Math.floor(domain[1]); t++) {
    ticks.push(t);
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full max-w-2xl h-[130px] sm:h-[150px]"
    >
      {band && (
        <motion.rect
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          x={scaleX(band.center - band.radius, domain)}
          y={dotY - 34}
          width={
            scaleX(band.center + band.radius, domain) -
            scaleX(band.center - band.radius, domain)
          }
          height={68}
          rx={8}
          fill="var(--color-accent)"
          opacity={0.12}
        />
      )}

      <line
        x1={PAD}
        y1={dotY + 40}
        x2={WIDTH - PAD}
        y2={dotY + 40}
        stroke="var(--color-paper)"
        opacity={0.25}
        strokeWidth={1.5}
      />
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={scaleX(t, domain)}
            y1={dotY + 34}
            x2={scaleX(t, domain)}
            y2={dotY + 46}
            stroke="var(--color-paper)"
            opacity={0.35}
          />
          <text
            x={scaleX(t, domain)}
            y={dotY + 63}
            fontSize="12"
            fontFamily="'IBM Plex Mono', monospace"
            textAnchor="middle"
            fill="var(--color-paper)"
            opacity={0.45}
          >
            {t}
          </text>
        </g>
      ))}

      {meanValue !== undefined && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <line
            x1={scaleX(meanValue, domain)}
            y1={dotY - 40}
            x2={scaleX(meanValue, domain)}
            y2={dotY + 40}
            stroke="var(--color-accent)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <text
            x={scaleX(meanValue, domain)}
            y={dotY - 48}
            fontSize="12"
            fontFamily="'IBM Plex Mono', monospace"
            textAnchor="middle"
            fill="var(--color-accent)"
          >
            mean = {meanValue.toFixed(2).replace(/\.00$/, "")}
          </text>
        </motion.g>
      )}

      {values.map((v, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{ x: scaleX(v, domain) }}
          transition={SPRING_SNAP}
        >
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 14 }}
            cx={0}
            cy={dotY}
            r={11}
            fill={DOT_COLORS[i % DOT_COLORS.length]}
          />
          {showValues && (
            <text
              x={0}
              y={dotY + 4.5}
              fontSize="12"
              fontFamily="'IBM Plex Mono', monospace"
              fontWeight="600"
              textAnchor="middle"
              fill="var(--color-ink)"
            >
              {v}
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export { DOT_COLORS };
