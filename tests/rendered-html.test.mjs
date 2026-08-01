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
  const styles = await readFile(new URL("styles/prototype.css", publicRoot), "utf8");
  const component = await readFile(new URL("scripts/component.js", publicRoot), "utf8");
  const boot = await readFile(new URL("scripts/boot.js", publicRoot), "utf8");

  assert.match(prototype, /styles\/prototype\.css/);
  assert.match(prototype, /scripts\/component\.js/);
  assert.match(prototype, /scripts\/boot\.js/);
  assert.doesNotMatch(prototype, /<style>/);
  assert.doesNotMatch(prototype, /class Component extends DCLogic/);
  assert.match(component, /siteHeaderStyle/);
  assert.match(component, /navVisible/);
  assert.match(component, /exportMode \? 1 : st\.daysP/);
  assert.match(component, /--product-zoom/);
  assert.match(component, /productStageRef/);
  assert.match(component, /translateY\(-115%\)/);
  assert.match(component, /backdropFilter: 'blur\(18px\)'/);
  assert.match(component, /motion-section/);
  assert.doesNotMatch(component, /\.sc-host > div\[data-screen-label\]/);
  assert.match(component, /prototype-loading/);
  assert.match(styles, /x-dc\{display:none!important\}/);
  assert.match(styles, /html\.prototype-loading #dc-root\{opacity:0\}/);
  assert.match(prototype, /feature-icon--leap/);
  assert.match(prototype, /feature-icon--dock/);
  assert.match(prototype, /sticky-product-visual/);
  assert.match(styles, /@keyframes icon-leap/);
  assert.match(styles, /@keyframes icon-dock-pulse/);
  assert.match(styles, /page-progress/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(boot, /data-dc-src/);
  assert.match(boot, /prototype-loading/);
  assert.match(prototype, /assets\/official\/hero-l50\.png/);
  assert.doesNotMatch(prototype, /class="days-card"/);
  assert.doesNotMatch(prototype, /showSpecs|\.\/refs\/|\.\/uploads\//);

  await access(new URL("assets/official/hero-l50.png", publicRoot));
  await access(new URL("assets/official/pet-find.webp", publicRoot));
  await access(new URL("vendor/dc-runtime.js", publicRoot));
});
