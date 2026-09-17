import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { getOverlapWindow } from "./overlap.js";
import { computeMeanVector, computeStdVector, computeCovarianceMatrix, computeCorrelationMatrix, EXCLUDED_FUND_IDS } from "./maths.js";
import {
  jacobiEigen,
  computeEffectiveN,
  correlationDictToMatrix,
  sanityCheckEigenvaluesSumToN,
} from "./eigen.js";

// Wider tolerance than the exact-arithmetic checks in earlier layers --
// Jacobi convergence order can differ slightly between the Python and JS
// implementations even though the algorithm is identical, so closeness
// is the right bar here, not exact equality.
const TOL = 1e-3;

const fixtures = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "fixtures.json"), "utf8")
);
const data = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "funds_aligned.json"), "utf8")
);

function assertClose(actual, expected, tol = TOL, msg = "") {
  assert.ok(
    Math.abs(actual - expected) < tol,
    `${msg} expected ${expected}, got ${actual} (diff ${Math.abs(actual - expected)})`
  );
}

test("jacobiEigen — toy 3-fund correlation matrix", () => {
  const fixture = fixtures.toy_3fund;
  const [eigenvalues] = jacobiEigen(fixture.correlation_matrix);
  const sorted = [...eigenvalues].sort((a, b) => b - a);

  const sum = sanityCheckEigenvaluesSumToN(eigenvalues, 3);
  assertClose(sum, 3.0, TOL, "eigenvalue sum");

  for (let i = 0; i < 3; i++) {
    assertClose(sorted[i], fixture.eigenvalues[i], TOL, `eigenvalue[${i}]`);
  }

  const effectiveN = computeEffectiveN(eigenvalues);
  assertClose(effectiveN, fixture.effective_n, TOL, "effective N");
});

test("jacobiEigen — full 44-fund universe", () => {
  const fixture = fixtures.full_universe_eigen;
  const fundIds = fixtures.overlap_window.all_44_funds.fund_ids.filter(
    (fid) => !EXCLUDED_FUND_IDS.includes(fid)
  );
  const window = getOverlapWindow(fundIds, data);
  const means = computeMeanVector(fundIds, window, data);
  const stds = computeStdVector(fundIds, window, data, means);
  const cov = computeCovarianceMatrix(fundIds, window, data, means);
  const corr = computeCorrelationMatrix(fundIds, window, data, means, stds, cov);

  const matrix = correlationDictToMatrix(corr, fundIds);
  const [eigenvalues] = jacobiEigen(matrix);
  const sorted = [...eigenvalues].sort((a, b) => b - a);

  const sum = sanityCheckEigenvaluesSumToN(eigenvalues, fundIds.length);
  assertClose(sum, fundIds.length, TOL, "eigenvalue sum");

  const effectiveN = computeEffectiveN(eigenvalues);
  assertClose(effectiveN, fixture.effective_n, TOL, "effective N");
  assertClose(sorted[0], fixture.top_eigenvalue, TOL, "top eigenvalue");
});
