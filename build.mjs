import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(projectDir, "public");

await mkdir(publicDir, { recursive: true });
for (const target of [
  "prototype.html",
  "dreame-l50-ultra.html",
  "styles",
  "scripts",
  "vendor",
  "css",
  "js",
  "styles.css",
  "app.js",
  "interactions.js",
  "dc-runtime.js",
  "assets",
]) {
  await rm(join(publicDir, target), { recursive: true, force: true });
}
await copyFile(
  join(projectDir, "index.html"),
  join(publicDir, "dreame-l50-ultra.html"),
);

for (const file of ["styles.css", "app.js", "interactions.js", "dc-runtime.js"]) {
  await copyFile(join(projectDir, file), join(publicDir, file));
}

const assetReferences = new Set();
const sourceFiles = [
  join(projectDir, "index.html"),
  join(projectDir, "styles.css"),
  join(projectDir, "interactions.js"),
];

for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, "utf8");
  for (const match of source.matchAll(/\.\/assets\/([A-Za-z0-9_./-]+)/g)) {
    if (!match[1].includes("..")) assetReferences.add(match[1]);
  }
}

for (const assetPath of assetReferences) {
  const destination = join(publicDir, "assets", assetPath);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(projectDir, "assets", assetPath), destination);
}
