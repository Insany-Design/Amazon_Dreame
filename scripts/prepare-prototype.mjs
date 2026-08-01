import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(projectDir, "prototype");
const publicDir = join(projectDir, "public");

await mkdir(publicDir, { recursive: true });
for (const target of ["prototype.html", "styles", "scripts", "vendor", "assets"]) {
  await rm(join(publicDir, target), { recursive: true, force: true });
}
await copyFile(
  join(sourceDir, "index.html"),
  join(publicDir, "prototype.html"),
);

for (const directory of ["styles", "scripts", "vendor", "assets"]) {
  await cp(join(sourceDir, directory), join(publicDir, directory), {
    recursive: true,
    force: true,
  });
}
