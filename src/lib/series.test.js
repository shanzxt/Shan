import { test } from "node:test"
import assert from "node:assert/strict"
import { formatLakh, monotone } from "./series.js"
import { sipScenarios } from "../data/newsletter.js"

test("monotone curve passes through every real sample", () => {
  for (const s of sipScenarios.series) {
    const f = monotone(s.values)
    s.values.forEach((v, i) => assert.ok(Math.abs(f(i / (s.values.length - 1)) - v) < 1e-9))
  }
})

test("monotone curve never dips below a previous sample on a rising series", () => {
  const f = monotone(sipScenarios.series[0].values)
  let prev = -Infinity
  for (let i = 0; i <= 500; i++) {
    const y = f(i / 500)
    assert.ok(y >= prev - 1e-9)
    prev = y
  }
})

test("lakh figures print the way the issue does", () => {
  assert.equal(formatLakh(472), "₹4.72Cr")
  assert.equal(formatLakh(8.6), "₹8.6L")
  assert.equal(formatLakh(43), "₹43L")
})
