import { cp, copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(projectDir, "..");
const publicDir = join(projectDir, "public");

await mkdir(publicDir, { recursive: true });
await copyFile(
  join(sourceDir, "Wireframe L50 Ultra.dc.html"),
  join(publicDir, "prototype.html"),
);
await copyFile(join(sourceDir, "support.js"), join(publicDir, "support.js"));

for (const directory of ["assets"]) {
  await cp(join(sourceDir, directory), join(publicDir, directory), {
    recursive: true,
    force: true,
  });
}
