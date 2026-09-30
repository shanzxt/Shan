import test from "node:test";
import assert from "node:assert/strict";

import { headingId, issueHeadings } from "./headings.js";
import { issues } from "../data/newsletter.js";

test("headingId makes url-safe slugs", () => {
  assert.equal(headingId("So why doesn't everyone just wait?"), "so-why-doesn-t-everyone-just-wait");
  assert.equal(headingId("How I Built This"), "how-i-built-this");
});

test("heading ids are unique within each issue", () => {
  for (const issue of issues) {
    const ids = issueHeadings(issue.content).map((h) => h.id);
    assert.equal(new Set(ids).size, ids.length, `${issue.id}: duplicate heading ids`);
  }
});
