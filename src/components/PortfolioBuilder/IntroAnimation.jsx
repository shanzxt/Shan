import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stage1Dataset from "./Stage1Dataset";
import Stage2Mean, { STAGE2_STEPS } from "./Stage2Mean";
import Stage3StdDev, { STAGE3_STEPS } from "./Stage3StdDev";
import Stage4Portfolio, { STAGE4_STEPS } from "./Stage4Portfolio";
import { EASE_OUT } from "../../lib/motion";

const STAGES = [
  { Component: Stage1Dataset, steps: 1 },
  { Component: Stage2Mean, steps: STAGE2_STEPS },
  { Component: Stage3StdDev, steps: STAGE3_STEPS },
  { Component: Stage4Portfolio, steps: STAGE4_STEPS },
];

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -28 : 28,
  }),
};

export default function IntroAnimation() {
  const [stageIndex, setStageIndex] = useState(0);
  const [microStep, setMicroStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);

  const stage = STAGES[stageIndex];
  const isLastMicroStep = microStep === stage.steps - 1;
  const isLastStage = stageIndex === STAGES.length - 1;

  function handleNext() {
    setDirection(1);
    if (!isLastMicroStep) {
      setMicroStep((s) => s + 1);
    } else if (!isLastStage) {
      setStageIndex((s) => s + 1);
      setMicroStep(0);
    } else {
      setDone(true);
    }
  }

  function handleBack() {
    setDirection(-1);
    if (done) {
      setDone(false);
      return;
    }
    if (microStep > 0) {
      setMicroStep((s) => s - 1);
    } else if (stageIndex > 0) {
      const prevStage = STAGES[stageIndex - 1];
      setStageIndex((s) => s - 1);
      setMicroStep(prevStage.steps - 1);
    }
  }

  const canGoBack = done || stageIndex > 0 || microStep > 0;

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-10 sm:gap-12">
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-xs tracking-wide text-teal">
          {done ? "recap" : `stage ${stageIndex + 1} of ${STAGES.length}`}
        </span>
        <div className="flex gap-2">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-colors duration-500 ${
                done || i < stageIndex
                  ? "bg-accent"
                  : i === stageIndex
                    ? "bg-accent/50"
                    : "bg-paper/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative w-full min-h-[420px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {done ? (
            <motion.div
              key="done"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: EASE_OUT }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-4"
            >
              <span className="font-mono text-xs tracking-wide text-teal">
                the idea, in full
              </span>
              <h2 className="max-w-lg font-display text-2xl font-light leading-snug text-paper sm:text-3xl">
                Mean, spread, and how spread combines across a weighted mix.
              </h2>
              <p className="max-w-md text-[15px] text-paper/60">
                Next, we'll run exactly this math on real mutual funds.
              </p>
              <button
                type="button"
                onClick={() =>
                  document.getElementById("fund-picker")?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-2 rounded-md bg-accent px-5 py-2 font-mono text-sm text-ink transition-colors hover:bg-accent/85"
              >
                Try it on real funds ↓
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${stageIndex}-${microStep}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <stage.Component step={microStep} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {
        <div className="flex items-center gap-4 font-mono text-sm">
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            className="rounded-md border hr-line px-4 py-2 text-paper/70 transition-colors hover:border-paper/30 hover:text-paper disabled:cursor-not-allowed disabled:opacity-25"
          >
            Back
          </button>
          {!done && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-accent px-5 py-2 text-ink transition-colors hover:bg-accent/85"
            >
              {isLastMicroStep && isLastStage ? "Finish" : "Next"}
            </button>
          )}
        </div>
      }
    </div>
  );
}
