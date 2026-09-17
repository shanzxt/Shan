// Standalone toy-dataset math for the intro animation. Deliberately separate
// from a fund-shaped math engine (which expects date-indexed multi-fund
// data) — these operate on flat arrays of plain numbers, e.g. [1, 2, 3, 4, 5].
// Same formulas as the real engine (arithmetic mean, sample variance/std
// dev with n-1 denominator) so the toy example and real engine agree.

export function mean(values) {
  return values.reduce((sum, x) => sum + x, 0) / values.length;
}

export function deviations(values, m = mean(values)) {
  return values.map((x) => x - m);
}

export function sampleVariance(values, m = mean(values)) {
  const squaredDevs = deviations(values, m).map((d) => d * d);
  return squaredDevs.reduce((sum, x) => sum + x, 0) / (values.length - 1);
}

export function sampleStd(values, m = mean(values)) {
  return Math.sqrt(sampleVariance(values, m));
}

// Sample covariance between two equal-length arrays, same n-1 convention.
export function sampleCovariance(a, b, meanA = mean(a), meanB = mean(b)) {
  const devA = deviations(a, meanA);
  const devB = deviations(b, meanB);
  const products = devA.map((d, i) => d * devB[i]);
  return products.reduce((sum, x) => sum + x, 0) / (a.length - 1);
}

// Builds a covariance matrix (array of arrays) for a list of equal-length
// return series, e.g. [[assetA returns], [assetB returns], [assetC returns]].
export function covarianceMatrix(series) {
  const n = series.length;
  const means = series.map((s) => mean(s));
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = sampleCovariance(series[i], series[j], means[i], means[j]);
    }
  }
  return matrix;
}

// w^T Sigma w, the portfolio variance formula.
export function portfolioVariance(weights, covMatrix) {
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  return variance;
}

export function portfolioStd(weights, covMatrix) {
  return Math.sqrt(portfolioVariance(weights, covMatrix));
}
