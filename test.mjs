import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const relativePath = `${prefix}${entry.name}`;
    if (!entry.isDirectory()) return [relativePath];
    return listFiles(new URL(`${entry.name}/`, directory), `${relativePath}/`);
  }));
  return files.flat();
}

async function render(pathname = "/") {
  const workerUrl = new URL("./dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("redirects the public root to the static product page", async () => {
  const response = await render();
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/dreame-l50-ultra.html");
});

test("ships separated HTML, CSS, JavaScript and product assets", async () => {
  const publicRoot = new URL("./public/", import.meta.url);
  const page = await readFile(new URL("dreame-l50-ultra.html", publicRoot), "utf8");
  const styles = await readFile(new URL("styles.css", publicRoot), "utf8");
  const interactions = await readFile(new URL("interactions.js", publicRoot), "utf8");
  const app = await readFile(new URL("app.js", publicRoot), "utf8");

  assert.match(page, /lang="pt-BR"/);
  assert.match(page, /styles\.css/);
  assert.match(page, /interactions\.js/);
  assert.match(page, /app\.js/);
  assert.match(page, /rel="preload"[^>]+hero-l50\.png/);
  assert.doesNotMatch(page, /<style>/);
  assert.doesNotMatch(page, /class Component extends DCLogic/);
  assert.match(interactions, /siteHeaderStyle/);
  assert.match(interactions, /navVisible/);
  assert.match(interactions, /exportMode \? 1 : st\.daysP/);
  assert.match(interactions, /--product-zoom/);
  assert.match(interactions, /productStageRef/);
  assert.match(interactions, /translateY\(-115%\)/);
  assert.match(interactions, /backdropFilter: 'blur\(18px\)'/);
  assert.match(interactions, /motion-section/);
  assert.doesNotMatch(interactions, /\.sc-host > div\[data-screen-label\]/);
  assert.match(interactions, /prototype-loading/);
  assert.match(styles, /x-dc\{display:none!important\}/);
  assert.match(styles, /html\.prototype-loading #dc-root\{opacity:0\}/);
  assert.match(page, /feature-icon--leap/);
  assert.match(page, /feature-icon--dock/);
  assert.match(page, /sticky-product-visual/);
  assert.match(styles, /@keyframes icon-leap/);
  assert.match(styles, /@keyframes icon-dock-pulse/);
  assert.match(styles, /page-progress/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(app, /data-dc-src/);
  assert.match(app, /prototype-loading/);
  assert.match(page, /assets\/official\/hero-l50\.png/);
  assert.doesNotMatch(page, /class="days-card"/);
  assert.doesNotMatch(page, /showSpecs|\.\/refs\/|\.\/uploads\//);

  const assetReferences = new Set();
  for (const source of [page, styles, interactions]) {
    for (const match of source.matchAll(/\.\/assets\/([A-Za-z0-9_./-]+)/g)) {
      assetReferences.add(match[1]);
    }
  }
  for (const assetPath of assetReferences) {
    await access(new URL(`assets/${assetPath}`, publicRoot));
  }

  const sourceAssets = (await listFiles(new URL("./assets/", import.meta.url)))
    .filter((assetPath) => !assetPath.split("/").some((part) => part.startsWith(".")));
  assert.deepEqual(
    sourceAssets.sort(),
    [...assetReferences].sort(),
    "assets/ deve conter somente arquivos referenciados pela landing page",
  );

  await access(new URL("assets/official/hero-l50.png", publicRoot));
  await access(new URL("assets/official/pet-find.webp", publicRoot));
  await access(new URL("dc-runtime.js", publicRoot));
});
