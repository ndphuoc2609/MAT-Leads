import { readFile } from "node:fs/promises";

const metadata = JSON.parse(
  await readFile(new URL("../.output/nitro.json", import.meta.url), "utf8"),
);

if (metadata.preset !== "node-server") {
  throw new Error(
    `Render requires the Nitro node-server preset, but this build produced ${metadata.preset}.`,
  );
}

console.log(`Verified Nitro preset: ${metadata.preset}`);
