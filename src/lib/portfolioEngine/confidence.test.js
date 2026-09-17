import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { getOverlapWindow } from "./overlap.js";
import { computeMeanVector, computeStdVector, EXCLUDED_FUND_IDS } from "./maths.js";
import { computePortfolioWindowNote, computeConfidenceFlags } from "./confidence.js";

const fixtures = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "fixtures.json"), "utf8")
);
const data = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "funds_aligned.json"), "utf8")
);

test("computePortfolioWindowNote / computeConfidenceFlags — full 44-fund universe", () => {
  const fixture = fixtures.confidence_flags;
  const fundIds = fixtures.overlap_window.all_44_funds.fund_ids.filter(
    (fid) => !EXCLUDED_FUND_IDS.includes(fid)
  );
  const window = getOverlapWindow(fundIds, data);
  const means = computeMeanVector(fundIds, window, data);
  const stds = computeStdVector(fundIds, window, data, means);

  const note = computePortfolioWindowNote(fundIds, window, data);
  assert.deepEqual(note, fixture.portfolio_window_note);

  const flags = computeConfidenceFlags(fundIds, window, data, stds);
  assert.equal(flags.size, fixture.n_flagged_funds);
  assert.deepEqual(flags.get(152881), fixture.flags_152881);
  assert.deepEqual(flags.get(119091), fixture.flags_119091);
  assert.deepEqual(flags.get(120754), fixture.flags_120754);
});
