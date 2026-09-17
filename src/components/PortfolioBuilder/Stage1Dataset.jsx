import { motion } from "framer-motion";
import NumberLine from "./NumberLine";
import { EASE_OUT } from "../../lib/motion";

const DATASET = [1, 2, 3, 4, 5];

export default function Stage1Dataset() {
  return (
    <div className="flex flex-col items-center gap-7">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <span className="font-mono text-xs tracking-wide text-teal">
          starting point
        </span>
        <h2 className="font-display text-2xl font-light text-paper sm:text-3xl">
          A dataset of five numbers
        </h2>
      </motion.div>
      <NumberLine values={DATASET} domain={[0, 6]} />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="font-mono text-sm text-paper/50 tabular-nums"
      >
        {DATASET.join(", ")}
      </motion.p>
    </div>
  );
}

export { DATASET };
