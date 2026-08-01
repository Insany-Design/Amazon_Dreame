import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Dreame prototype shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Dreame L50 Ultra<\/title>/i);
  assert.match(html, /<iframe[^>]+src="\/prototype\.html"/i);
  assert.doesNotMatch(html, /codex-preview|loading skeleton|Starter Project/i);
});

test("ships the current prototype and official product photography", async () => {
  const publicRoot = new URL("../public/", import.meta.url);
  const prototype = await readFile(new URL("prototype.html", publicRoot), "utf8");

  assert.match(prototype, /siteHeaderStyle/);
  assert.match(prototype, /navVisible/);
  assert.match(prototype, /translateY\(-115%\)/);
  assert.match(prototype, /backdropFilter: 'blur\(18px\)'/);
  assert.match(prototype, /assets\/official\/hero-l50\.png/);
  assert.match(prototype, /assets\/official\/dock-system\.webp/);
  assert.doesNotMatch(prototype, /showSpecs|\.\/refs\/|\.\/uploads\//);

  await access(new URL("assets/official/hero-l50.png", publicRoot));
  await access(new URL("assets/official/pet-find.webp", publicRoot));
});
