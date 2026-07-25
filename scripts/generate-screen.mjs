import { mkdir, writeFile } from "node:fs/promises";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("generate", `${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const response = await worker.fetch(
  new Request("https://local.test/api/screen", { method: "POST" }),
  {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  },
  { waitUntil() {}, passThroughOnException() {} },
);

const payload = await response.json();
if (!response.ok) throw new Error(payload.error ?? `Screen failed with ${response.status}`);
if (!Array.isArray(payload.results) || payload.results.length !== 10) {
  throw new Error("Expected exactly ten screen results.");
}

const outputDirectory = new URL("../docs/data/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  new URL("latest.json", outputDirectory),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);

console.log(`Saved ${payload.results.length} stocks using data through ${payload.dataDate}.`);
