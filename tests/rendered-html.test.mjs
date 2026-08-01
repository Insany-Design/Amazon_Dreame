import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("redirects the public root to the full prototype without an iframe", async () => {
  const response = await render();
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/prototype.html");
});

test("provides a dedicated full-page Figma export route", async () => {
  const response = await render("/figma");
  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.pathname, "/prototype.html");
  assert.equal(location.search, "?figma=1");
});

test("ships the current prototype and official product photography", async () => {
  const publicRoot = new URL("../public/", import.meta.url);
  const prototype = await readFile(new URL("prototype.html", publicRoot), "utf8");

  assert.match(prototype, /siteHeaderStyle/);
  assert.match(prototype, /navVisible/);
  assert.match(prototype, /figma-export/);
  assert.match(prototype, /exportMode \? 1 : st\.daysP/);
  assert.match(prototype, /translateY\(-115%\)/);
  assert.match(prototype, /backdropFilter: 'blur\(18px\)'/);
  assert.match(prototype, /assets\/official\/hero-l50\.png/);
  assert.match(prototype, /assets\/official\/dock-system\.webp/);
  assert.doesNotMatch(prototype, /showSpecs|\.\/refs\/|\.\/uploads\//);

  await access(new URL("assets/official/hero-l50.png", publicRoot));
  await access(new URL("assets/official/pet-find.webp", publicRoot));
});
