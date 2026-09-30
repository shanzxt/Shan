// Server-renders every prerendered route (plus a 404) and fails if any
// component throws or a real route falls through to the 404 page.
// Run via `npm run test:routes` (builds dist-ssr first).
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const server = await import(pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href);
const { prerenderRoutes } = await server.loadSeo();

async function renderChecked(url) {
  const errors = [];
  const html = await server.render(url, { onError: (err) => errors.push(err) });
  assert.deepEqual(errors, [], `${url} threw while rendering`);
  return html;
}

for (const url of prerenderRoutes()) {
  test(`renders ${url}`, async () => {
    const html = await renderChecked(url);
    assert.match(html, /<h1[\s>]/, `${url}: no <h1>`);
    assert.doesNotMatch(html, /Nothing on this frequency/, `${url}: rendered the 404 page`);
    assert.doesNotMatch(html, /Signal dropped/, `${url}: rendered the error fallback`);
  });
}

test("unknown routes render the 404 page", async () => {
  const html = await renderChecked("/no-such-page");
  assert.match(html, /Nothing on this frequency/);
});

test("unknown issue slugs render the 404 page", async () => {
  const html = await renderChecked("/newsletters/no-such-issue");
  assert.match(html, /Nothing on this frequency/);
});
