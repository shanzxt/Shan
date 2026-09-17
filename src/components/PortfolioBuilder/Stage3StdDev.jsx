import { motion, AnimatePresence } from "framer-motion";
import NumberLine, { scaleX, DOT_COLORS } from "./NumberLine";
import { mean, deviations, sampleVariance, sampleStd } from "../../lib/toyMath";
import { DATASET } from "./Stage1Dataset";
import { EASE_OUT } from "../../lib/motion";

export const STAGE3_STEPS = 5;

const MEAN = mean(DATASET);
const DEVIATIONS = deviations(DATASET, MEAN);
const SQUARED = DEVIATIONS.map((d) => d * d);
const SUM_SQUARED = SQUARED.reduce((a, b) => a + b, 0);
const VARIANCE = sampleVariance(DATASET, MEAN);
const STD = sampleStd(DATASET, MEAN);

const DOMAIN = [0, 6];
const WIDTH = 640;
const HEIGHT = 220;

// Deviation arrows and their squares share the same x-position (the dot's
// coordinate on the axis), so the square visibly grows *out of* the arrow
// it belongs to rather than appearing as an unrelated second diagram --
// this is the core insight of variance (distance -> squared distance) and
// gets the most deliberate staging in the whole animation.
function DeviationCanvas({ showSquares }) {
  const meanX = scaleX(MEAN, DOMAIN);
  const dotY = 100;
  const maxAbsDev = Math.max(...DEVIATIONS.map(Math.abs));
  const maxSide = 46;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-2xl h-[190px] sm:h-[220px]">
      <line
        x1={meanX}
        y1={dotY - 40}
        x2={meanX}
        y2={dotY + 40}
        stroke="var(--color-accent)"
        strokeDasharray="4 4"
        strokeWidth={1.5}
        opacity={0.7}
      />
      {DATASET.map((v, i) => {
        const x = scaleX(v, DOMAIN);
        const side = (Math.abs(DEVIATIONS[i]) / maxAbsDev) * maxSide || 4;
        return (
          <g key={i}>
            <motion.g
              animate={{ opacity: showSquares ? 0.35 : 1 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <motion.line
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12, ease: EASE_OUT }}
                x1={meanX}
                y1={dotY - 30 - i * 12}
                x2={x}
                y2={dotY - 30 - i * 12}
                stroke={DOT_COLORS[i]}
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 + 0.15, ease: EASE_OUT }}
                x={(meanX + x) / 2}
                y={dotY - 36 - i * 12}
                fontSize="11"
                fontFamily="'IBM Plex Mono', monospace"
                textAnchor="middle"
                fill={DOT_COLORS[i]}
              >
                {DEVIATIONS[i] > 0 ? `+${DEVIATIONS[i]}` : DEVIATIONS[i]}
              </motion.text>
            </motion.g>
            <circle cx={x} cy={dotY} r={9} fill={DOT_COLORS[i]} />

            {showSquares && (
              <motion.g
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 240, damping: 16 }}
              >
                <rect
                  x={x - side / 2}
                  y={dotY + 30}
                  width={side}
                  height={side}
                  rx={3}
                  fill={DOT_COLORS[i]}
                />
                <text
                  x={x}
                  y={dotY + 30 + side + 18}
                  fontSize="12"
                  fontFamily="'IBM Plex Mono', monospace"
                  textAnchor="middle"
                  fill="var(--color-paper)"
                  opacity={0.55}
                >
                  {SQUARED[i]}
                </text>
              </motion.g>
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-paper)" opacity={0.6} />
        </marker>
      </defs>
    </svg>
  );
}

export default function Stage3StdDev({ step }) {
  return (
    <div className="flex flex-col items-center gap-6 min-h-[320px] justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono text-xs tracking-wide text-teal">
          step {step + 1} of {STAGE3_STEPS}
        </span>
        <h2 className="font-display text-2xl font-light text-paper sm:text-3xl">
          How spread out is the data?
        </h2>
      </div>

      {step === 0 && (
        <div className="flex flex-col items-center gap-3">
          <DeviationCanvas showSquares={false} />
          <p className="max-w-md text-center text-[15px] text-paper/60">
            Each point's distance from the mean ({MEAN}) is its deviation.
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center gap-3">
          <DeviationCanvas showSquares={true} />
          <p className="max-w-md text-center text-[15px] text-paper/60">
            Square each deviation — that way, negative and positive distances
            both count as spread.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 2 && (
          <motion.div
            key="sumsq"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: EASE_OUT }}
            className="flex flex-wrap items-center justify-center gap-2 font-mono text-2xl tabular-nums"
          >
            {SQUARED.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.25, ease: EASE_OUT }}
                  style={{ color: DOT_COLORS[i] }}
                >
                  {s}
                </motion.span>
                {i < SQUARED.length - 1 && <span className="text-paper/30">+</span>}
              </span>
            ))}
            <span className="text-paper/30">=</span>
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: SQUARED.length * 0.25 + 0.25, type: "spring", stiffness: 260, damping: 18 }}
              className="text-accent"
            >
              {SUM_SQUARED}
            </motion.span>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="variance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: EASE_OUT }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3 font-mono text-2xl tabular-nums">
              <span className="text-accent">{SUM_SQUARED}</span>
              <span className="text-paper/30">/</span>
              <span className="text-paper">({DATASET.length} - 1)</span>
              <span className="text-paper/30">=</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 18 }}
                className="text-3xl text-accent"
              >
                {VARIANCE}
              </motion.span>
            </div>
            <p className="text-xs text-paper/40">
              This is the <em>variance</em> — dividing by n&minus;1 (sample
              variance), not n.
            </p>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="sqrt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: EASE_OUT }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3 font-mono text-2xl tabular-nums">
              <span className="text-paper">&radic;{VARIANCE}</span>
              <span className="text-paper/30">=</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 18 }}
                className="text-3xl text-accent"
              >
                {STD.toFixed(2)}
              </motion.span>
            </div>
            <NumberLine
              values={DATASET}
              domain={DOMAIN}
              meanValue={MEAN}
              band={{ center: MEAN, radius: STD }}
            />
            <p className="max-w-md text-center text-[15px] text-paper/60">
              That's the standard deviation — the typical distance a point
              sits from the mean, shown here as the shaded band.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
