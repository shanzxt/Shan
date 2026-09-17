import { motion } from "framer-motion";
import {
  covarianceMatrix,
  portfolioVariance,
  portfolioStd,
} from "../../lib/toyMath";
import { TOY_ASSETS, TOY_WEIGHTS } from "../../lib/toyPortfolioData";
import { DOT_COLORS } from "./NumberLine";
import { EASE_OUT } from "../../lib/motion";

export const STAGE4_STEPS = 5;

const SERIES = TOY_ASSETS.map((a) => a.returns);
const COV = covarianceMatrix(SERIES);
const VARIANCE = portfolioVariance(TOY_WEIGHTS, COV);
const STD = portfolioStd(TOY_WEIGHTS, COV);

function round(x) {
  return Math.round(x * 100) / 100;
}

export default function Stage4Portfolio({ step }) {
  return (
    <div className="flex flex-col items-center gap-6 min-h-[360px] justify-center w-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono text-xs tracking-wide text-teal">
          step {step + 1} of {STAGE4_STEPS}
        </span>
        <h2 className="font-display text-2xl font-light text-paper sm:text-3xl">
          From one series to a portfolio
        </h2>
      </div>

      {step === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: EASE_OUT }}
          className="flex flex-col items-center gap-4 max-w-xl"
        >
          <p className="text-center text-[15px] text-paper/70">
            A single number series was just "one asset." A real portfolio
            holds several at once.
          </p>
          <p className="max-w-md rounded-md border hr-line bg-accent/[0.06] px-4 py-3 text-center text-sm text-accent">
            This is the whole point of this tool: the same variance math,
            just applied to a weighted mix of assets instead of one.
          </p>
          <div className="grid grid-cols-1 gap-3 mt-1 sm:grid-cols-3 sm:gap-4">
            {TOY_ASSETS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, ease: EASE_OUT }}
                className="rounded-lg border hr-line p-3 text-sm"
              >
                <div className="font-mono font-semibold" style={{ color: DOT_COLORS[i] }}>
                  {a.name}
                </div>
                <div className="mt-1 font-mono text-xs text-paper/45 tabular-nums">
                  {a.returns.join(", ")}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: EASE_OUT }}
          className="flex flex-col items-center gap-5"
        >
          <p className="max-w-sm text-center text-[15px] text-paper/70">
            Each asset gets a weight — how much of the portfolio it makes up.
          </p>
          <div className="flex gap-6 sm:gap-10">
            {TOY_ASSETS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 220, damping: 16 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="font-mono text-xs" style={{ color: DOT_COLORS[i] }}>
                  {a.name}
                </span>
                <span className="font-mono text-2xl text-accent tabular-nums">
                  {TOY_WEIGHTS[i]}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: EASE_OUT }}
          className="flex flex-col items-center gap-4"
        >
          <p className="max-w-lg text-center text-[15px] text-paper/70">
            Covariance measures how two assets' deviations move together —
            the same idea as squaring one deviation, extended to a pair.
            <span className="block mt-1 text-xs text-paper/40">
              The diagonal (highlighted) is just each asset's own variance.
            </span>
          </p>
          <table className="border-collapse font-mono text-sm">
            <thead>
              <tr>
                <td></td>
                {TOY_ASSETS.map((a, j) => (
                  <td key={a.name} className="px-3 py-1.5 text-xs" style={{ color: DOT_COLORS[j] }}>
                    {a.name}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOY_ASSETS.map((a, i) => (
                <motion.tr
                  key={a.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.18, ease: EASE_OUT }}
                >
                  <td className="px-3 py-1.5 text-xs" style={{ color: DOT_COLORS[i] }}>
                    {a.name}
                  </td>
                  {TOY_ASSETS.map((_, j) => {
                    const isDiagonal = i === j;
                    return (
                      <motion.td
                        key={j}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.18 + j * 0.06 + 0.15 }}
                        className={`px-3 py-1.5 border text-center tabular-nums ${
                          isDiagonal
                            ? "hr-line bg-accent/10 text-accent"
                            : "hr-line text-paper/70"
                        }`}
                      >
                        {round(COV[i][j])}
                      </motion.td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: EASE_OUT }}
          className="flex flex-col items-center gap-4 max-w-xl"
        >
          <p className="text-center text-[15px] text-paper/70">
            Portfolio variance: multiply every pair of weights by that pair's
            covariance, and sum it all up.
          </p>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 font-mono text-sm max-w-lg tabular-nums">
            {TOY_WEIGHTS.flatMap((wi, i) =>
              TOY_WEIGHTS.map((wj, j) => {
                const idx = i * TOY_WEIGHTS.length + j;
                return (
                  <motion.span
                    key={`${i}-${j}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, ease: EASE_OUT }}
                    className="text-paper/70"
                  >
                    w<sub>{i + 1}</sub>w<sub>{j + 1}</sub>&sigma;
                    <sub>
                      {i + 1}
                      {j + 1}
                    </sub>
                    {idx < TOY_WEIGHTS.length * TOY_WEIGHTS.length - 1 ? " + " : ""}
                  </motion.span>
                );
              })
            )}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="font-mono text-xs text-paper/40"
          >
            w<sup>T</sup>&Sigma;w
          </motion.div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: EASE_OUT }}
          className="flex flex-col items-center gap-5"
        >
          <p className="text-center text-[15px] text-paper/70">
            That collapses to one number.
          </p>
          <div className="flex items-center gap-8 font-mono text-2xl tabular-nums">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs text-paper/45">portfolio variance</span>
              <span className="text-accent">{round(VARIANCE)}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 18 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs text-paper/45">portfolio std dev</span>
              <span className="text-accent">{round(STD)}</span>
            </motion.div>
          </div>
          <p className="max-w-md text-center text-[15px] text-paper/60">
            Same formula as before — mean, deviations, squares, sum — just
            generalized from one series to a weighted mix of several.
          </p>
        </motion.div>
      )}
    </div>
  );
}
