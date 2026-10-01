import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { issues } from "./newsletter.js";

const publicDir = path.join(import.meta.dirname, "..", "..", "public");

test("every issue image exists, with a .webp sibling and explicit dimensions", () => {
  for (const issue of issues) {
    for (const block of issue.content ?? []) {
      if (block.type !== "image") continue;
      const file = path.join(publicDir, block.src);
      assert.ok(fs.existsSync(file), `${issue.slug ?? issue.id}: missing ${block.src}`);
      if (block.src.endsWith(".png")) {
        const webp = file.replace(/\.png$/, ".webp");
        assert.ok(fs.existsSync(webp), `${block.src}: run python scripts/make-webp.py`);
      }
      assert.ok(block.width && block.height, `${block.src}: set width/height`);
      assert.ok(block.alt, `${block.src}: alt text required`);
    }
  }
});

test("issue sparklines match the portfolio engine's output", async () => {
  const { getOverlapWindow } = await import("../lib/portfolioEngine/overlap.js");
  const { computePortfolioStats } = await import("../lib/portfolioEngine/portfolioMath.js");
  const { EXCLUDED_FUND_IDS } = await import("../lib/portfolioEngine/maths.js");
  const data = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "lib", "portfolioEngine", "funds_aligned.json"), "utf8"));
  const ids = data.funds.map((f) => f.id).filter((id) => !EXCLUDED_FUND_IDS.includes(id));
  const stats = computePortfolioStats(new Map(ids.map((id) => [id, 1])), ids, getOverlapWindow(ids, data), data);
  const ev = [...stats.eigenvalues].sort((a, b) => b - a);
  const total = ev.reduce((a, b) => a + b, 0);
  const spark = issues.find((i) => i.id === "44-funds-2-bets").spark;
  spark.values.forEach((v, i) => assert.ok(Math.abs(v - (ev[i] / total) * 100) < 0.01, `factor ${i + 1}`));
});

test("every headline index points at a real stat", () => {
  for (const issue of issues) {
    if (issue.headline != null) assert.ok(issue.stats[issue.headline], issue.id);
  }
});
