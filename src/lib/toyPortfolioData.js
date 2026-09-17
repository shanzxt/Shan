// Made-up returns for stage 4's toy 3-asset portfolio -- purely for
// teaching the w^T Sigma w formula shape, not real fund data. Asset C is
// deliberately low-variance and roughly uncorrelated with A/B, so the
// diversification effect (adding it lowers portfolio risk) shows up
// numerically, echoing the real fund universe's debt-fund finding.
export const TOY_ASSETS = [
  { name: "Asset A", returns: [4, 6, -2, 8, 3, -1, 5, 2] },
  { name: "Asset B", returns: [3, 5, -1, 7, 4, 0, 4, 3] },
  { name: "Asset C", returns: [1, 0.5, 1.2, 0.8, 1, 0.9, 1.1, 0.7] },
];

export const TOY_WEIGHTS = [0.4, 0.3, 0.3];
