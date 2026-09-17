// Real, validated fund-id lists demonstrating the newsletter's core thesis.
// Effective N values are cross-checked against js/fixtures.json's
// thesis_test fixture (all_equity_effective_n / equity_plus_debt_effective_n)
// in the n2-Diversification source repo — not recomputed or guessed here.
export const ALL_EQUITY_PRESET = {
  label: "All-equity portfolio",
  fundIds: [118632, 118955, 120166, 118834, 120158, 118989, 119775],
  expectedEffectiveN: 1.2431758154172698,
};

export const EQUITY_PLUS_DEBT_PRESET = {
  label: "Add the debt fund",
  fundIds: [118632, 118955, 120166, 118834, 120158, 118989, 119775, 119091],
  expectedEffectiveN: 1.6605580942449014,
};
