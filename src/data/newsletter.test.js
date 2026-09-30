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
