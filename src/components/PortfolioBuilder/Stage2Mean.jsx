import { motion, AnimatePresence } from "framer-motion";
import NumberLine from "./NumberLine";
import { mean } from "../../lib/toyMath";
import { DATASET } from "./Stage1Dataset";
import { EASE_OUT } from "../../lib/motion";

export const STAGE2_STEPS = 3;

const RUNNING_SUMS = DATASET.reduce((acc, v, i) => {
  const prev = i === 0 ? 0 : acc[i - 1];
  acc.push(prev + v);
  return acc;
}, []);

const TOTAL = RUNNING_SUMS[RUNNING_SUMS.length - 1];
const MEAN = mean(DATASET);

export default function Stage2Mean({ step }) {
  return (
    <div className="flex flex-col items-center gap-8 min-h-[260px] justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono text-xs tracking-wide text-teal">
          step {step + 1} of {STAGE2_STEPS}
        </span>
        <h2 className="font-display text-2xl font-light text-paper sm:text-3xl">
          Finding the mean
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="sum"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: EASE_OUT }}
            className="flex flex-wrap items-center justify-center gap-2 font-mono text-2xl tabular-nums"
          >
            {DATASET.map((v, i) => (
              <span key={i} className="flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3, ease: EASE_OUT }}
                  className="text-paper"
                >
                  {v}
                </motion.span>
                {i < DATASET.length - 1 && <span className="text-paper/30">+</span>}
              </span>
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: DATASET.length * 0.3 }}
              className="text-paper/30"
            >
              =
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: DATASET.length * 0.3 + 0.25, type: "spring", stiffness: 260, damping: 18 }}
              className="text-accent"
            >
              {TOTAL}
            </motion.span>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="divide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: EASE_OUT }}
            className="flex items-center gap-3 font-mono text-2xl tabular-nums"
          >
            <span className="text-accent">{TOTAL}</span>
            <span className="text-paper/30">/</span>
            <span className="text-paper">{DATASET.length}</span>
            <span className="text-paper/30">=</span>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 18 }}
              className="text-3xl text-accent"
            >
              {MEAN}
            </motion.span>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="converge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: EASE_OUT }}
            className="flex flex-col items-center gap-4"
          >
            <NumberLine
              values={DATASET.map(() => MEAN)}
              domain={[0, 6]}
              meanValue={MEAN}
              showValues={false}
            />
            <p className="max-w-md text-center text-[15px] text-paper/60">
              The mean is where the data balances — its center of mass. Watch
              all five points settle onto it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
