import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";

function sitesMetadata(): Plugin {
  let root = process.cwd();

  return {
    name: "sites-metadata",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const output = resolve(root, "dist", ".openai");
      await rm(output, { recursive: true, force: true });
      await mkdir(output, { recursive: true });
      await cp(
        resolve(root, ".openai", "hosting.json"),
        resolve(output, "hosting.json"),
      );
    },
  };
}

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server:
      process.env.CODEX_SANDBOX === "seatbelt"
        ? { watch: { useFsEvents: false, usePolling: true } }
        : undefined,
    plugins: [
      vinext(),
      sitesMetadata(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: {
          main: "./worker.ts",
          compatibility_flags: ["nodejs_compat"],
        },
      }),
    ],
  };
});
